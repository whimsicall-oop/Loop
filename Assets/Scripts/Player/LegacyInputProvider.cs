using UnityEngine;

namespace Skybound.Player
{
    /// <summary>
    /// Default <see cref="IInputProvider"/> built on Unity's always-available legacy
    /// Input Manager so the project compiles and plays with zero package dependencies.
    /// For shipping builds, swap this for an Input System (new) implementation that
    /// supports rebinding and gamepad rumble — the rest of the codebase is unaffected.
    ///
    /// Edge-triggered flags are latched in <see cref="Tick"/> so consumers can poll
    /// them multiple times per frame without losing presses.
    /// </summary>
    public class LegacyInputProvider : MonoBehaviour, IInputProvider
    {
        [Header("Axis Bindings")]
        [SerializeField] private string _horizontalAxis = "Horizontal";
        [SerializeField] private string _verticalAxis = "Vertical";
        [SerializeField, Range(0f, 0.5f)] private float _deadzone = 0.15f;

        [Header("Key Bindings")]
        [SerializeField] private KeyCode _jump = KeyCode.Space;
        [SerializeField] private KeyCode _dash = KeyCode.LeftShift;
        [SerializeField] private KeyCode _sprint = KeyCode.LeftControl;
        [SerializeField] private KeyCode _attack = KeyCode.J;
        [SerializeField] private KeyCode _groundPound = KeyCode.S;
        [SerializeField] private KeyCode _powerCycle = KeyCode.Q;
        [SerializeField] private KeyCode _powerUse = KeyCode.K;

        public float MoveX { get; private set; }
        public float MoveY { get; private set; }
        public bool SprintHeld { get; private set; }
        public bool JumpPressed { get; private set; }
        public bool JumpReleased { get; private set; }
        public bool JumpHeld { get; private set; }
        public bool DashPressed { get; private set; }
        public bool AttackPressed { get; private set; }
        public bool AttackHeld { get; private set; }
        public bool GroundPoundPressed { get; private set; }
        public bool PowerCyclePressed { get; private set; }
        public bool PowerUsePressed { get; private set; }

        public void Tick()
        {
            MoveX = ApplyDeadzone(Input.GetAxisRaw(_horizontalAxis));
            MoveY = ApplyDeadzone(Input.GetAxisRaw(_verticalAxis));

            SprintHeld = Input.GetKey(_sprint);

            JumpPressed = Input.GetKeyDown(_jump);
            JumpReleased = Input.GetKeyUp(_jump);
            JumpHeld = Input.GetKey(_jump);

            DashPressed = Input.GetKeyDown(_dash);
            AttackPressed = Input.GetKeyDown(_attack);
            AttackHeld = Input.GetKey(_attack);
            GroundPoundPressed = Input.GetKeyDown(_groundPound) && MoveY < -0.5f;
            PowerCyclePressed = Input.GetKeyDown(_powerCycle);
            PowerUsePressed = Input.GetKeyDown(_powerUse);
        }

        private float ApplyDeadzone(float raw)
        {
            return Mathf.Abs(raw) < _deadzone ? 0f : raw;
        }
    }
}
