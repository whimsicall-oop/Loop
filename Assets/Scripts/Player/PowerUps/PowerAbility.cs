using UnityEngine;

namespace Skybound.Player.PowerUps
{
    /// <summary>
    /// Strategy base class for an active power ability. Concrete abilities (FireProjectile,
    /// IceFreeze, LightningDash, WindGlide, WingFlight) live as separate ScriptableObjects,
    /// so the power system follows open/closed: extend by adding subclasses, never edit the
    /// controller. <see cref="PowerContext"/> hands the ability everything it needs.
    /// </summary>
    public abstract class PowerAbility : ScriptableObject
    {
        /// <summary>Called when the player triggers the power. Return false if it could not fire.</summary>
        public abstract bool Activate(in PowerContext ctx);

        /// <summary>Per-frame upkeep for sustained abilities (glide, flight). Return false when finished.</summary>
        public virtual bool Tick(in PowerContext ctx, float deltaTime) => false;

        /// <summary>Cleanup when the ability ends or the power is swapped.</summary>
        public virtual void End(in PowerContext ctx) { }
    }

    /// <summary>Lightweight bundle of references an ability operates on.</summary>
    public readonly struct PowerContext
    {
        public readonly GameObject Player;
        public readonly Transform Transform;
        public readonly Movement.PlayerMotor Motor;
        public readonly int Facing;

        public PowerContext(GameObject player, Movement.PlayerMotor motor)
        {
            Player = player;
            Transform = player.transform;
            Motor = motor;
            Facing = motor != null ? motor.Facing : 1;
        }
    }
}
