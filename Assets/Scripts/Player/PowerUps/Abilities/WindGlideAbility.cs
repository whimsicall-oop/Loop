using UnityEngine;

namespace Skybound.Player.PowerUps.Abilities
{
    /// <summary>
    /// Wind Orb: a sustained ability. While held, dampens fall speed to a gentle glide and
    /// nudges horizontal drift, letting the player cover long gaps. Returns true from Tick
    /// until the player lands or the ability is released by the controller.
    /// </summary>
    [CreateAssetMenu(menuName = "Skybound/PowerUps/Abilities/Wind Glide", fileName = "WindGlide")]
    public class WindGlideAbility : PowerAbility
    {
        [SerializeField] private float _glideFallSpeed = 2.5f;
        [SerializeField] private float _driftAccel = 14f;

        public override bool Activate(in PowerContext ctx)
        {
            // Only meaningful airborne; ground use is a no-op (cooldown not consumed).
            return !ctx.Motor.IsGrounded;
        }

        public override bool Tick(in PowerContext ctx, float deltaTime)
        {
            if (ctx.Motor.IsGrounded)
            {
                return false;
            }

            // Cancel most downward velocity to a soft float, then ease toward glide speed.
            Vector2 v = ctx.Motor.Velocity;
            if (v.y < -_glideFallSpeed)
            {
                float corrected = Mathf.MoveTowards(v.y, -_glideFallSpeed, _driftAccel * deltaTime);
                ctx.Motor.AddImpulse(new Vector2(0f, corrected - v.y));
            }

            return true;
        }
    }
}
