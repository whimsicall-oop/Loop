using UnityEngine;

namespace Skybound.Player
{
    /// <summary>
    /// Abstraction over the input backend. The gameplay layer depends only on this
    /// interface, so we can swap the legacy Input Manager for Unity's Input System
    /// package (or a replay/AI driver for automated tests) without touching movement code.
    /// </summary>
    public interface IInputProvider
    {
        /// <summary>Horizontal axis, -1..1, already deadzoned.</summary>
        float MoveX { get; }

        /// <summary>Vertical axis, -1..1 (used for crouch / climb / look).</summary>
        float MoveY { get; }

        bool SprintHeld { get; }

        bool JumpPressed { get; }
        bool JumpReleased { get; }
        bool JumpHeld { get; }

        bool DashPressed { get; }
        bool AttackPressed { get; }
        bool AttackHeld { get; }
        bool GroundPoundPressed { get; }
        bool PowerCyclePressed { get; }
        bool PowerUsePressed { get; }

        /// <summary>Called once per frame to latch edge-triggered values.</summary>
        void Tick();
    }
}
