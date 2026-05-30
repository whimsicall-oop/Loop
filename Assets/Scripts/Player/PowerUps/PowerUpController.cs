using System;
using System.Collections.Generic;
using Skybound.Core;
using Skybound.Player.Movement;
using UnityEngine;

namespace Skybound.Player.PowerUps
{
    /// <summary>
    /// Owns the player's currently-equipped elemental power: equipping (which restyles the
    /// character + swaps movement tuning), cycling between collected powers, and firing the
    /// active ability with cooldown / sustained-duration handling. Knows nothing about the
    /// specific powers — it drives <see cref="PowerUpDefinition"/> data and ability strategies.
    /// </summary>
    [RequireComponent(typeof(PlayerMotor))]
    public class PowerUpController : MonoBehaviour
    {
        [SerializeField] private MonoBehaviour _inputSource;
        [SerializeField] private Animator _characterAnimator;
        [SerializeField] private MovementConfig _baseMovementConfig;
        [SerializeField] private List<PowerUpDefinition> _startingPowers = new List<PowerUpDefinition>();

        private IInputProvider _input;
        private PlayerMotor _motor;

        private readonly List<PowerUpDefinition> _owned = new List<PowerUpDefinition>();
        private int _activeIndex = -1;
        private GameObject _activeAura;
        private GameTimer _cooldown;
        private GameTimer _durationTimer;
        private bool _abilityRunning;

        public PowerType ActivePower =>
            _activeIndex >= 0 && _activeIndex < _owned.Count ? _owned[_activeIndex].Type : PowerType.None;

        public event Action<PowerUpDefinition> PowerEquipped;
        public event Action<PowerType, float> CooldownStarted; // (type, seconds)

        private void Awake()
        {
            _motor = GetComponent<PlayerMotor>();
            _input = _inputSource as IInputProvider;
            foreach (var p in _startingPowers)
            {
                Collect(p);
            }
            if (_owned.Count > 0)
            {
                Equip(0);
            }
        }

        private void Update()
        {
            if (_input == null || !GameStateMachine.Instance.IsPlayable)
            {
                return;
            }

            _cooldown.Tick(Time.deltaTime);

            if (_input.PowerCyclePressed)
            {
                CycleNext();
            }

            if (_input.PowerUsePressed)
            {
                TryActivate();
            }
        }

        private void FixedUpdate()
        {
            if (!_abilityRunning || _activeIndex < 0)
            {
                return;
            }

            PowerUpDefinition def = _owned[_activeIndex];
            var ctx = new PowerContext(gameObject, _motor);

            bool stillRunning = def.Ability != null && def.Ability.Tick(in ctx, Time.fixedDeltaTime);
            bool durationExpired = def.Duration > 0f && _durationTimer.Tick(Time.fixedDeltaTime);

            if (!stillRunning || durationExpired)
            {
                EndActiveAbility(def, in ctx);
            }
        }

        /// <summary>Add a power to the player's kit (called on orb pickup). Ignores duplicates.</summary>
        public void Collect(PowerUpDefinition def)
        {
            if (def != null && !_owned.Contains(def))
            {
                _owned.Add(def);
            }
        }

        public void CycleNext()
        {
            if (_owned.Count == 0)
            {
                return;
            }

            Equip((_activeIndex + 1) % _owned.Count);
        }

        public void Equip(int index)
        {
            if (index < 0 || index >= _owned.Count)
            {
                return;
            }

            _activeIndex = index;
            PowerUpDefinition def = _owned[index];

            // Visual identity: skin + aura.
            if (_characterAnimator != null && def.CharacterOverride != null)
            {
                _characterAnimator.runtimeAnimatorController = def.CharacterOverride;
            }

            if (_activeAura != null)
            {
                Destroy(_activeAura);
            }
            if (def.AuraVfx != null)
            {
                _activeAura = Instantiate(def.AuraVfx, transform);
            }

            // Movement identity: glide/speed overrides, or revert to base.
            _motor.SetConfig(def.MovementOverride != null ? def.MovementOverride : _baseMovementConfig);

            PowerEquipped?.Invoke(def);
        }

        private void TryActivate()
        {
            if (_activeIndex < 0 || _cooldown.IsRunning || _abilityRunning)
            {
                return;
            }

            PowerUpDefinition def = _owned[_activeIndex];
            if (def.Ability == null)
            {
                return;
            }

            var ctx = new PowerContext(gameObject, _motor);
            if (!def.Ability.Activate(in ctx))
            {
                return;
            }

            _cooldown.Start(def.Cooldown);
            CooldownStarted?.Invoke(def.Type, def.Cooldown);

            if (def.Duration > 0f)
            {
                _durationTimer.Start(def.Duration);
                _abilityRunning = true;
            }
        }

        private void EndActiveAbility(PowerUpDefinition def, in PowerContext ctx)
        {
            def.Ability?.End(in ctx);
            _abilityRunning = false;
        }
    }
}
