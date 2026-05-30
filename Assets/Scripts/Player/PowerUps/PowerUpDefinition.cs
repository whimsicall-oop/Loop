using Skybound.Player.Movement;
using UnityEngine;

namespace Skybound.Player.PowerUps
{
    /// <summary>
    /// Authoring data for one elemental power. Bundles the visual identity (tint, trail,
    /// equipped sprite/skin), the audio cue, an optional movement-config override (e.g.
    /// Wind glide, Lightning speed), and the active-ability parameters. Adding a new power
    /// is purely data + a small <see cref="PowerAbility"/> subclass — no manager changes.
    /// </summary>
    [CreateAssetMenu(menuName = "Skybound/PowerUps/Power Definition", fileName = "Power")]
    public class PowerUpDefinition : ScriptableObject
    {
        [Header("Identity")]
        public PowerType Type = PowerType.Fire;
        public string DisplayName = "Fire Orb";
        [TextArea] public string Description;
        public Color ThemeColor = new Color(1f, 0.45f, 0.15f);
        public Sprite Icon;

        [Header("Appearance Override")]
        [Tooltip("Optional override controller giving the character a power-themed skin & animations.")]
        public RuntimeAnimatorController CharacterOverride;
        [Tooltip("Trail / aura VFX prefab parented to the player while this power is active.")]
        public GameObject AuraVfx;

        [Header("Movement Override")]
        [Tooltip("If set, replaces the player's movement tuning while active (e.g. Wind glide, Lightning speed).")]
        public MovementConfig MovementOverride;

        [Header("Ability")]
        [Tooltip("Implementation of the active ability fired with the Power key.")]
        public PowerAbility Ability;
        public float Cooldown = 1.5f;
        [Tooltip("Optional duration for timed powers like Wing flight; 0 = instantaneous/toggle.")]
        public float Duration;

        [Header("Audio")]
        public string EquipSfxId = "power_equip";
        public string AbilitySfxId = "power_cast";
    }
}
