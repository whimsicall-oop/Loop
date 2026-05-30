using Skybound.Core;
using UnityEngine;

namespace Skybound.Player.Movement
{
    public enum MotorState
    {
        Grounded,
        Airborne,
        WallSliding,
        Dashing,
        GroundPounding,
        Crouching
    }

    /// <summary>
    /// The player's physics brain. Owns velocity integration and all "game feel" rules:
    /// coyote time, jump buffering, variable jump height, multi-jump, wall slide/jump,
    /// dash / air dash, ground pound, momentum and acceleration curves.
    ///
    /// Design notes:
    ///  • Uses a Dynamic Rigidbody2D with gravityScale = 0; we apply our own gravity so
    ///    rise/fall asymmetry and fast-fall behave exactly as authored (Unity's default
    ///    gravity feels floaty). Collision response stays with the physics engine.
    ///  • Reads input every Update (latching buffers) but integrates in FixedUpdate, so
    ///    feel is framerate-independent while presses are never dropped between ticks.
    ///  • Emits events (Jumped, Landed, Dashed...) so VFX/SFX/animation hook in without
    ///    this class knowing they exist.
    /// </summary>
    [RequireComponent(typeof(Rigidbody2D))]
    [RequireComponent(typeof(CollisionSensor))]
    public class PlayerMotor : MonoBehaviour
    {
        [SerializeField] private MovementConfig _config;
        [SerializeField] private MonoBehaviour _inputSource; // must implement IInputProvider

        private IInputProvider _input;
        private Rigidbody2D _rb;
        private CollisionSensor _sensor;

        private Vector2 _velocity;
        private MotorState _state = MotorState.Airborne;
        private int _facing = 1;

        // Forgiveness & cooldown timers.
        private GameTimer _coyote;
        private GameTimer _jumpBuffer;
        private GameTimer _dashCooldown;
        private GameTimer _dashTimer;
        private GameTimer _wallJumpLockout;
        private GameTimer _wallStick;
        private GameTimer _groundPoundHang;

        private int _jumpsRemaining;
        private int _airDashesRemaining;
        private bool _jumpHeldThisRise;
        private bool _wasGrounded;

        // --- Public surface for animation / combat / VFX systems ---
        public MotorState State => _state;
        public Vector2 Velocity => _velocity;
        public int Facing => _facing;
        public bool IsGrounded => _sensor.Grounded;
        public MovementConfig Config => _config;

        public event System.Action JumpedEvent;
        public event System.Action WallJumpedEvent;
        public event System.Action DashedEvent;
        public event System.Action GroundPoundStartedEvent;
        /// <summary>Fired on landing with the downward speed at impact (for dust / camera shake scaling).</summary>
        public event System.Action<float> LandedEvent;

        private void Awake()
        {
            _rb = GetComponent<Rigidbody2D>();
            _sensor = GetComponent<CollisionSensor>();
            _input = _inputSource as IInputProvider;

            _rb.gravityScale = 0f;
            _rb.freezeRotation = true;
            _rb.collisionDetectionMode = CollisionDetectionMode2D.Continuous;
            _rb.interpolation = RigidbodyInterpolation2D.Interpolate;
        }

        private void Update()
        {
            if (_input == null || !GameStateMachine.Instance.IsPlayable)
            {
                return;
            }

            _input.Tick();

            // Buffer the jump press so it survives until we are allowed to consume it.
            if (_input.JumpPressed)
            {
                _jumpBuffer.Start(_config.JumpBuffer);
            }
        }

        private void FixedUpdate()
        {
            if (_input == null || !GameStateMachine.Instance.IsPlayable)
            {
                return;
            }

            float dt = Time.fixedDeltaTime;
            _sensor.Probe();

            TickTimers(dt);
            UpdateGroundedState();

            switch (_state)
            {
                case MotorState.Dashing:
                    TickDash(dt);
                    break;
                case MotorState.GroundPounding:
                    TickGroundPound(dt);
                    break;
                default:
                    TickStandardLocomotion(dt);
                    break;
            }

            _rb.velocity = _velocity;
        }

        private void TickTimers(float dt)
        {
            _coyote.Tick(dt);
            _jumpBuffer.Tick(dt);
            _dashCooldown.Tick(dt);
            _wallJumpLockout.Tick(dt);
            _wallStick.Tick(dt);
        }

        private void UpdateGroundedState()
        {
            bool grounded = _sensor.Grounded && _velocity.y <= 0.01f;

            if (grounded)
            {
                if (!_wasGrounded)
                {
                    LandedEvent?.Invoke(Mathf.Abs(_velocity.y));
                }

                _coyote.Start(_config.CoyoteTime);
                _jumpsRemaining = _config.MaxJumps;
                _airDashesRemaining = _config.AirDashes;
            }

            _wasGrounded = grounded;
        }

        private void TickStandardLocomotion(float dt)
        {
            HandleHorizontal(dt);
            HandleGravity(dt);
            HandleWall(dt);

            if (TryConsumeJump())
            {
                return;
            }

            if (_input.DashPressed && _dashCooldown.IsRunning == false)
            {
                TryStartDash();
                return;
            }

            if (_input.GroundPoundPressed && !_sensor.Grounded)
            {
                StartGroundPound();
                return;
            }

            UpdateState();
        }

        private void HandleHorizontal(float dt)
        {
            float input = _input.MoveX;

            // Wall-jump lockout dampens steering so the jump arc reads cleanly.
            if (_wallJumpLockout.IsRunning)
            {
                input *= 0.35f;
            }

            float maxSpeed = ResolveTargetSpeed();
            float target = input * maxSpeed;

            bool grounded = _sensor.Grounded;
            float accel = Mathf.Abs(target) > 0.01f
                ? (grounded ? _config.GroundAccel : _config.AirAccel)
                : (grounded ? _config.GroundDecel : _config.AirDecel);

            // Snappier turnarounds: boost decel when input opposes current velocity.
            if (target * _velocity.x < 0f)
            {
                accel *= _config.TurnBoost;
            }

            _velocity.x = Mathf.MoveTowards(_velocity.x, target, accel * dt);

            if (Mathf.Abs(input) > 0.01f && !_wallJumpLockout.IsRunning)
            {
                _facing = input > 0f ? 1 : -1;
            }
        }

        private float ResolveTargetSpeed()
        {
            if (_state == MotorState.Crouching)
            {
                return _config.CrouchSpeed;
            }

            return _input.SprintHeld ? _config.SprintSpeed : _config.WalkSpeed;
        }

        private void HandleGravity(float dt)
        {
            if (_sensor.Grounded && _velocity.y <= 0f)
            {
                _velocity.y = -1f; // small stick-to-ground bias for slopes/steps
                return;
            }

            float gravity = _config.Gravity;

            // Asymmetric gravity = responsive, weighty feel (Ori/Celeste style).
            if (_velocity.y < 0f)
            {
                gravity *= _config.FallGravityMultiplier;
            }
            else if (_velocity.y > 0f && !_input.JumpHeld)
            {
                // Released jump early → cut the rise for variable jump height.
                gravity *= _config.LowJumpGravityMultiplier;
            }

            _velocity.y += gravity * dt;

            // Fast-fall when actively holding down in the air.
            float fallCap = _input.MoveY < -0.5f ? -_config.FastFallSpeed : -_config.MaxFallSpeed;
            _velocity.y = Mathf.Max(_velocity.y, fallCap);

            if (_sensor.CeilingHit && _velocity.y > 0f)
            {
                _velocity.y = 0f; // bonk
            }
        }

        private void HandleWall(float dt)
        {
            bool canWallSlide = !_sensor.Grounded
                                && _sensor.OnWall
                                && _sensor.WallDirection == _facing
                                && _velocity.y < 0f
                                && Mathf.Abs(_input.MoveX) > 0.01f;

            if (canWallSlide)
            {
                _velocity.y = Mathf.Max(_velocity.y, -_config.WallSlideSpeed);
                _wallStick.Start(_config.WallStickTime);

                // A jump press while sliding becomes a wall jump.
                if (_jumpBuffer.IsRunning)
                {
                    DoWallJump();
                }
            }
        }

        private bool TryConsumeJump()
        {
            if (!_jumpBuffer.IsRunning)
            {
                return false;
            }

            // Ground / coyote jump.
            if (_coyote.IsRunning)
            {
                DoJump(_config.JumpVelocity);
                _jumpsRemaining = _config.MaxJumps - 1;
                _coyote.Stop();
                return true;
            }

            // Air (double / triple) jump.
            if (_jumpsRemaining > 0)
            {
                int index = _config.MaxJumps - _jumpsRemaining; // 1-based air jump number
                float scale = Mathf.Pow(_config.AirJumpScale, index);
                DoJump(_config.JumpVelocity * scale);
                _jumpsRemaining--;
                return true;
            }

            return false;
        }

        private void DoJump(float velocity)
        {
            _velocity.y = velocity;
            _jumpBuffer.Stop();
            _state = MotorState.Airborne;
            JumpedEvent?.Invoke();
        }

        private void DoWallJump()
        {
            int away = -_sensor.WallDirection;
            _velocity = new Vector2(_config.WallJumpVelocity.x * away, _config.WallJumpVelocity.y);
            _facing = away;
            _jumpBuffer.Stop();
            _wallJumpLockout.Start(_config.WallJumpLockout);
            _jumpsRemaining = _config.MaxJumps - 1; // refund air jumps after a wall jump
            WallJumpedEvent?.Invoke();
        }

        private void TryStartDash()
        {
            if (!_sensor.Grounded)
            {
                if (_airDashesRemaining <= 0)
                {
                    return;
                }

                _airDashesRemaining--;
            }

            _state = MotorState.Dashing;
            _dashTimer.Start(_config.DashDuration);
            _dashCooldown.Start(_config.DashCooldown);

            float dir = Mathf.Abs(_input.MoveX) > 0.01f ? Mathf.Sign(_input.MoveX) : _facing;
            _facing = (int)dir;
            _velocity.x = dir * _config.DashSpeed;
            if (_config.DashCancelsGravity)
            {
                _velocity.y = 0f;
            }

            DashedEvent?.Invoke();
        }

        private void TickDash(float dt)
        {
            // Maintain dash velocity; allow ceiling/wall to interrupt naturally via physics.
            if (_dashTimer.Tick(dt) || _sensor.OnWall && _sensor.WallDirection == _facing)
            {
                // Preserve a fraction of momentum out of the dash for fluid chaining.
                _velocity.x = Mathf.Sign(_velocity.x) * _config.SprintSpeed;
                _state = MotorState.Airborne;
            }
        }

        private void StartGroundPound()
        {
            _state = MotorState.GroundPounding;
            _velocity = Vector2.zero;
            _groundPoundHang.Start(_config.GroundPoundHangTime);
            GroundPoundStartedEvent?.Invoke();
        }

        private void TickGroundPound(float dt)
        {
            if (_groundPoundHang.Tick(dt) || _groundPoundHang.IsRunning == false)
            {
                _velocity.y = -_config.GroundPoundSpeed;
                _velocity.x = 0f;
            }

            if (_sensor.Grounded)
            {
                LandedEvent?.Invoke(_config.GroundPoundSpeed);
                _state = MotorState.Grounded;
                _velocity.y = 0f;
            }
        }

        private void UpdateState()
        {
            bool crouching = _sensor.Grounded && _input.MoveY < -0.5f && Mathf.Abs(_velocity.x) < 0.5f;

            if (crouching)
            {
                _state = MotorState.Crouching;
            }
            else if (_sensor.Grounded)
            {
                _state = MotorState.Grounded;
            }
            else if (_sensor.OnWall && _velocity.y < 0f && _sensor.WallDirection == _facing)
            {
                _state = MotorState.WallSliding;
            }
            else
            {
                _state = MotorState.Airborne;
            }
        }

        /// <summary>External knock-back / launch (combat, hazards, wind power).</summary>
        public void AddImpulse(Vector2 impulse)
        {
            _velocity += impulse;
        }

        /// <summary>Hot-swap the tuning profile (e.g. when a power-up changes mobility).</summary>
        public void SetConfig(MovementConfig config)
        {
            if (config != null)
            {
                _config = config;
            }
        }
    }
}
