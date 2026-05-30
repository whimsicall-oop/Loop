using Skybound.Core;
using Skybound.Player.Movement;
using UnityEngine;

namespace Skybound.Combat
{
    /// <summary>
    /// Drives the player's melee combo state machine on top of <see cref="Hitbox"/>.
    /// Implements startup → active → recovery phases and combo chaining inside a window.
    /// Damage scales off an external stat (set by the progression system) so skill-tree
    /// upgrades feed straight in. Stomp / dash attacks are handled by their own hooks.
    /// </summary>
    [RequireComponent(typeof(PlayerMotor))]
    public class PlayerCombat : MonoBehaviour
    {
        private enum Phase { Idle, Startup, Active, Recovery }

        [SerializeField] private AttackData _comboRoot;
        [SerializeField] private Hitbox _hitbox;
        [SerializeField] private MonoBehaviour _inputSource;

        private Skybound.Player.IInputProvider _input;
        private PlayerMotor _motor;

        private Phase _phase = Phase.Idle;
        private AttackData _currentAttack;
        private GameTimer _phaseTimer;
        private GameTimer _comboTimer;
        private bool _queuedNext;

        /// <summary>Multiplier applied to all attack damage (driven by progression).</summary>
        public float DamageMultiplier { get; set; } = 1f;

        public bool IsAttacking => _phase != Phase.Idle;

        public event System.Action<AttackData> AttackStarted;

        private void Awake()
        {
            _motor = GetComponent<PlayerMotor>();
            _input = _inputSource as Skybound.Player.IInputProvider;
        }

        private void Update()
        {
            if (_input == null || !GameStateMachine.Instance.IsPlayable)
            {
                return;
            }

            if (_input.AttackPressed)
            {
                if (_phase == Phase.Idle)
                {
                    BeginAttack(_comboRoot);
                }
                else if (_phase == Phase.Recovery && _comboTimer.IsRunning)
                {
                    _queuedNext = true; // buffer the combo continuation
                }
            }
        }

        private void FixedUpdate()
        {
            float dt = Time.fixedDeltaTime;
            _comboTimer.Tick(dt);

            switch (_phase)
            {
                case Phase.Startup:
                    if (_phaseTimer.Tick(dt))
                    {
                        EnterActive();
                    }
                    break;

                case Phase.Active:
                    _hitbox.Tick();
                    if (_phaseTimer.Tick(dt))
                    {
                        EnterRecovery();
                    }
                    break;

                case Phase.Recovery:
                    if (_phaseTimer.Tick(dt))
                    {
                        ResolveRecoveryEnd();
                    }
                    break;
            }
        }

        private void BeginAttack(AttackData attack)
        {
            if (attack == null)
            {
                return;
            }

            _currentAttack = attack;
            _phase = Phase.Startup;
            _phaseTimer.Start(attack.Startup);
            _queuedNext = false;

            // Lunge gives melee commitment and closes distance.
            _motor.AddImpulse(new Vector2(attack.LungeImpulse.x * _motor.Facing, attack.LungeImpulse.y));
            AttackStarted?.Invoke(attack);
        }

        private void EnterActive()
        {
            _phase = Phase.Active;
            _phaseTimer.Start(_currentAttack.Active);
            _hitbox.Activate(_currentAttack, _motor.Facing, DamageMultiplier, gameObject);
        }

        private void EnterRecovery()
        {
            _phase = Phase.Recovery;
            _hitbox.Deactivate();
            _phaseTimer.Start(_currentAttack.Recovery);
            _comboTimer.Start(_currentAttack.ComboWindow);
        }

        private void ResolveRecoveryEnd()
        {
            if (_queuedNext && _currentAttack.NextInCombo != null)
            {
                BeginAttack(_currentAttack.NextInCombo);
            }
            else
            {
                _phase = Phase.Idle;
                _currentAttack = null;
            }
        }
    }
}
