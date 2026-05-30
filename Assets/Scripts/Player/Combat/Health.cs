using System;
using Skybound.Core;
using UnityEngine;

namespace Skybound.Combat
{
    /// <summary>
    /// Reusable health component shared by the player and every enemy. Models the
    /// "hearts" economy (half-heart granularity), invincibility frames after a hit,
    /// and broadcasts events for HUD, VFX, and AI reactions. Death is a one-shot event.
    /// </summary>
    public class Health : MonoBehaviour, IDamageable
    {
        [Header("Hearts (1 heart = 2 HP for half-heart damage)")]
        [SerializeField] private int _maxHearts = 5;
        [SerializeField] private float _hpPerHeart = 2f;
        [SerializeField] private float _invincibilityTime = 0.8f;
        [SerializeField] private bool _grantIFramesOnHit = true;

        private float _current;
        private GameTimer _iFrames;

        public float Max => _maxHearts * _hpPerHeart;
        public float Current => _current;
        public float Normalized => Max > 0f ? _current / Max : 0f;
        public int MaxHearts => _maxHearts;
        public bool IsAlive => _current > 0f;
        public bool IsInvincible => _iFrames.IsRunning;

        public event Action<float, float> HealthChanged;   // (current, max)
        public event Action<DamageInfo> Damaged;
        public event Action Healed;
        public event Action Died;

        private void Awake() => _current = Max;
        private void Update() => _iFrames.Tick(Time.deltaTime);

        public void TakeDamage(in DamageInfo info)
        {
            if (!IsAlive || IsInvincible)
            {
                return;
            }

            _current = Mathf.Max(0f, _current - info.Amount);
            Damaged?.Invoke(info);
            HealthChanged?.Invoke(_current, Max);

            if (_grantIFramesOnHit)
            {
                _iFrames.Start(_invincibilityTime);
            }

            if (_current <= 0f)
            {
                Died?.Invoke();
            }
        }

        public void Heal(float amount)
        {
            if (!IsAlive)
            {
                return;
            }

            _current = Mathf.Min(Max, _current + amount);
            Healed?.Invoke();
            HealthChanged?.Invoke(_current, Max);
        }

        /// <summary>Used by the skill tree's "Extra Hearts" upgrade. Optionally tops up.</summary>
        public void SetMaxHearts(int hearts, bool refill)
        {
            _maxHearts = Mathf.Max(1, hearts);
            _current = refill ? Max : Mathf.Min(_current, Max);
            HealthChanged?.Invoke(_current, Max);
        }

        public void FullRestore()
        {
            _current = Max;
            HealthChanged?.Invoke(_current, Max);
        }
    }
}
