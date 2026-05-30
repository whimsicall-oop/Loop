using Skybound.Audio;
using Skybound.Combat;
using Skybound.Core;
using Skybound.Player.Movement;
using Skybound.Progression;
using Skybound.SaveData;
using Skybound.VFX;
using UnityEngine;

namespace Skybound.Player
{
    /// <summary>
    /// The player "facade": owns no gameplay rules itself, but wires the focused components
    /// (motor, combat, health, powers) to cross-cutting feedback (VFX, audio, camera) and to
    /// the progression stat block. This keeps each system single-responsibility while one
    /// place understands the whole character. Also handles death → checkpoint respawn.
    /// </summary>
    [RequireComponent(typeof(PlayerMotor))]
    [RequireComponent(typeof(Health))]
    public class PlayerController : MonoBehaviour
    {
        [SerializeField] private PlayerCombat _combat;
        [SerializeField] private float _heavyLandThreshold = 14f;

        private PlayerMotor _motor;
        private Health _health;

        private void Awake()
        {
            _motor = GetComponent<PlayerMotor>();
            _health = GetComponent<Health>();
        }

        private void OnEnable()
        {
            _motor.LandedEvent += OnLanded;
            _motor.JumpedEvent += OnJumped;
            _motor.DashedEvent += OnDashed;
            _motor.WallJumpedEvent += OnWallJumped;
            _motor.GroundPoundStartedEvent += OnGroundPound;

            _health.Damaged += OnDamaged;
            _health.Died += OnDied;

            if (ProgressionSystem.HasInstance)
            {
                ProgressionSystem.Instance.StatsChanged += ApplyStats;
            }
        }

        private void OnDisable()
        {
            _motor.LandedEvent -= OnLanded;
            _motor.JumpedEvent -= OnJumped;
            _motor.DashedEvent -= OnDashed;
            _motor.WallJumpedEvent -= OnWallJumped;
            _motor.GroundPoundStartedEvent -= OnGroundPound;

            _health.Damaged -= OnDamaged;
            _health.Died -= OnDied;

            if (ProgressionSystem.HasInstance)
            {
                ProgressionSystem.Instance.StatsChanged -= ApplyStats;
            }
        }

        private void Start()
        {
            if (ProgressionSystem.HasInstance)
            {
                ProgressionSystem.Instance.RecomputeStats();
                ApplyStats(ProgressionSystem.Instance.Stats);
            }
        }

        // --- Progression → live stats -----------------------------------------
        private void ApplyStats(PlayerStats stats)
        {
            _health.SetMaxHearts(5 + stats.BonusHearts, refill: false);
            if (_combat != null)
            {
                _combat.DamageMultiplier = stats.DamageMultiplier;
            }
            // Jump/dash/cooldown bonuses flow into the active MovementConfig at equip time;
            // here we could clone-and-patch the config. Kept explicit for clarity.
        }

        // --- Movement feedback -------------------------------------------------
        private void OnLanded(float impactSpeed)
        {
            float scale = Mathf.Clamp(impactSpeed / 12f, 0.6f, 1.8f);
            Vfx("landing_dust", scale);
            Sfx(impactSpeed >= _heavyLandThreshold ? "land_heavy" : "land_soft");
        }

        private void OnJumped() => Sfx("jump");
        private void OnWallJumped() { Sfx("wall_jump"); Vfx("wall_dust", 1f); }
        private void OnDashed() { Sfx("dash"); Vfx("dash_trail", 1f); }
        private void OnGroundPound() { Sfx("ground_pound"); Vfx("pound_shock", 1.2f); }

        // --- Damage / death ----------------------------------------------------
        private void OnDamaged(DamageInfo info)
        {
            Sfx("player_hurt");
            Vfx("hit_spark", 1f);
            if (HasCamera(out var shake))
            {
                shake.Shake(0.25f, 0.4f);
            }
        }

        private void OnDied()
        {
            Sfx("player_death");
            GameStateMachine.Instance.Set(GameState.GameOver);
            Invoke(nameof(Respawn), 1.5f);
        }

        private void Respawn()
        {
            SaveModel save = SaveSystem.HasInstance ? SaveSystem.Instance.Active : null;
            if (save != null && save.RespawnPosition.ToVector3() != Vector3.zero)
            {
                transform.position = save.RespawnPosition;
            }

            _health.FullRestore();
            GameStateMachine.Instance.Set(GameState.Playing);
        }

        // --- Helpers -----------------------------------------------------------
        private void Vfx(string id, float scale)
        {
            if (VfxManager.HasInstance) VfxManager.Instance.Spawn(id, transform.position, Quaternion.identity, scale);
        }

        private void Sfx(string id)
        {
            if (AudioManager.HasInstance) AudioManager.Instance.PlaySfx(id, transform.position);
        }

        private bool HasCamera(out CameraSystem.CameraShake shake)
        {
            shake = UnityEngine.Camera.main != null ? UnityEngine.Camera.main.GetComponent<CameraSystem.CameraShake>() : null;
            return shake != null;
        }
    }
}
