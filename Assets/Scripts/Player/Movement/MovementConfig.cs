using UnityEngine;

namespace Skybound.Player.Movement
{
    /// <summary>
    /// All movement tuning lives here as data, not code. Designers iterate on feel by
    /// editing this asset (or hot-swapping configs per power-up) without recompiling.
    /// Values are authored in intuitive units (desired jump height + time-to-apex) and
    /// converted to gravity/velocity at runtime, which is far more tunable than raw forces.
    /// </summary>
    [CreateAssetMenu(menuName = "Skybound/Movement Config", fileName = "MovementConfig")]
    public class MovementConfig : ScriptableObject
    {
        [Header("Horizontal — Speeds (units/sec)")]
        public float WalkSpeed = 6.5f;
        public float SprintSpeed = 10.5f;
        [Tooltip("Speed retained when crouch-walking.")]
        public float CrouchSpeed = 3.0f;

        [Header("Horizontal — Acceleration (units/sec^2)")]
        public float GroundAccel = 130f;
        public float GroundDecel = 160f;
        public float AirAccel = 90f;
        public float AirDecel = 70f;
        [Tooltip("Extra deceleration when reversing direction — gives crisp turns.")]
        public float TurnBoost = 1.8f;

        [Header("Jump — Authoring (height in units, time in sec)")]
        public float JumpHeight = 3.6f;
        public float TimeToApex = 0.38f;
        [Tooltip("Multiplier on gravity while falling — makes jumps feel snappy, not floaty.")]
        public float FallGravityMultiplier = 1.9f;
        [Tooltip("Multiplier on gravity after releasing jump early (variable height).")]
        public float LowJumpGravityMultiplier = 2.6f;
        public float MaxFallSpeed = 26f;
        [Tooltip("Fast-fall speed cap when holding down in the air.")]
        public float FastFallSpeed = 34f;

        [Header("Jump — Multi-jump")]
        [Tooltip("Total jumps available (1 = single, 2 = double, 3 = triple).")]
        [Range(1, 3)] public int MaxJumps = 3;
        [Tooltip("Each successive air jump scales the base jump velocity by this factor.")]
        [Range(0.5f, 1.2f)] public float AirJumpScale = 0.92f;

        [Header("Forgiveness Windows (seconds)")]
        public float CoyoteTime = 0.15f;
        public float JumpBuffer = 0.15f;

        [Header("Wall Interaction")]
        public float WallSlideSpeed = 3.2f;
        public Vector2 WallJumpVelocity = new Vector2(11f, 14f);
        [Tooltip("Time after a wall jump during which horizontal input is dampened, so the player visibly leaves the wall.")]
        public float WallJumpLockout = 0.12f;
        public float WallStickTime = 0.1f;

        [Header("Dash")]
        public float DashSpeed = 22f;
        public float DashDuration = 0.16f;
        public float DashCooldown = 0.55f;
        [Tooltip("Air dashes allowed before touching ground/wall.")]
        public int AirDashes = 1;
        [Tooltip("Vertical velocity is zeroed during a horizontal dash for a clean line.")]
        public bool DashCancelsGravity = true;

        [Header("Ground Pound")]
        public float GroundPoundSpeed = 30f;
        [Tooltip("Brief hover before the pound drops, for readability.")]
        public float GroundPoundHangTime = 0.08f;

        [Header("Crouch")]
        public float CrouchColliderScale = 0.6f;

        // --- Derived physics, computed from the designer-friendly values above. ---

        /// <summary>Gravity is negative. Derived from h = g*t^2/2 → g = -2h/t^2.</summary>
        public float Gravity => -(2f * JumpHeight) / (TimeToApex * TimeToApex);

        /// <summary>Initial jump velocity. Derived from v = g*t (taking magnitude).</summary>
        public float JumpVelocity => Mathf.Abs(Gravity) * TimeToApex;
    }
}
