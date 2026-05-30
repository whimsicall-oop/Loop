using System.Collections.Generic;
using Skybound.Combat;
using Skybound.Player.PowerUps;
using Skybound.Progression;
using Skybound.SaveData;
using UnityEngine;
using UnityEngine.UI;

namespace Skybound.UI
{
    /// <summary>
    /// Heads-up display: hearts, XP bar, currency, and the active power indicator with its
    /// cooldown radial. Subscribes to the relevant systems' events rather than polling, so
    /// it only redraws when something actually changes — cheap and always in sync.
    /// Heart icons are pooled/instantiated to match the (upgradeable) max-heart count.
    /// </summary>
    public class HUDController : MonoBehaviour
    {
        [Header("Refs")]
        [SerializeField] private Health _playerHealth;
        [SerializeField] private PowerUpController _powers;

        [Header("Hearts")]
        [SerializeField] private Transform _heartContainer;
        [SerializeField] private Image _heartPrefab;
        [SerializeField] private Sprite _heartFull;
        [SerializeField] private Sprite _heartHalf;
        [SerializeField] private Sprite _heartEmpty;

        [Header("XP / Currency")]
        [SerializeField] private Image _xpFill;
        [SerializeField] private Text _levelText;
        [SerializeField] private Text _coinText;
        [SerializeField] private Text _gemText;

        [Header("Power Indicator")]
        [SerializeField] private Image _powerIcon;
        [SerializeField] private Image _powerCooldownRadial;

        private readonly List<Image> _hearts = new List<Image>();
        private float _cooldownDuration;
        private float _cooldownRemaining;

        private void OnEnable()
        {
            if (_playerHealth != null)
            {
                _playerHealth.HealthChanged += OnHealthChanged;
                RebuildHearts();
                OnHealthChanged(_playerHealth.Current, _playerHealth.Max);
            }

            if (_powers != null)
            {
                _powers.PowerEquipped += OnPowerEquipped;
                _powers.CooldownStarted += OnCooldownStarted;
            }

            if (ProgressionSystem.HasInstance)
            {
                ProgressionSystem.Instance.XpChanged += OnXpChanged;
            }
        }

        private void OnDisable()
        {
            if (_playerHealth != null) _playerHealth.HealthChanged -= OnHealthChanged;
            if (_powers != null)
            {
                _powers.PowerEquipped -= OnPowerEquipped;
                _powers.CooldownStarted -= OnCooldownStarted;
            }
            if (ProgressionSystem.HasInstance) ProgressionSystem.Instance.XpChanged -= OnXpChanged;
        }

        private void Update()
        {
            if (_cooldownRemaining > 0f)
            {
                _cooldownRemaining -= Time.deltaTime;
                if (_powerCooldownRadial != null)
                {
                    _powerCooldownRadial.fillAmount = Mathf.Clamp01(_cooldownRemaining / _cooldownDuration);
                }
            }

            UpdateCurrency();
        }

        private void RebuildHearts()
        {
            foreach (var h in _hearts) Destroy(h.gameObject);
            _hearts.Clear();

            for (int i = 0; i < _playerHealth.MaxHearts; i++)
            {
                Image img = Instantiate(_heartPrefab, _heartContainer);
                _hearts.Add(img);
            }
        }

        private void OnHealthChanged(float current, float max)
        {
            if (_hearts.Count != _playerHealth.MaxHearts)
            {
                RebuildHearts();
            }

            // 2 HP per heart → full / half / empty.
            for (int i = 0; i < _hearts.Count; i++)
            {
                float heartValue = current - i * 2f;
                _hearts[i].sprite = heartValue >= 2f ? _heartFull
                    : heartValue >= 1f ? _heartHalf : _heartEmpty;
            }
        }

        private void OnXpChanged(float progress, int level)
        {
            if (_xpFill != null) _xpFill.fillAmount = progress;
            if (_levelText != null) _levelText.text = $"Lv {level}";
        }

        private void OnPowerEquipped(PowerUpDefinition def)
        {
            if (_powerIcon != null)
            {
                _powerIcon.sprite = def.Icon;
                _powerIcon.color = def.ThemeColor;
            }
            if (_powerCooldownRadial != null) _powerCooldownRadial.fillAmount = 0f;
        }

        private void OnCooldownStarted(PowerType type, float seconds)
        {
            _cooldownDuration = seconds;
            _cooldownRemaining = seconds;
        }

        private void UpdateCurrency()
        {
            SaveModel s = SaveSystem.HasInstance ? SaveSystem.Instance.Active : null;
            if (s == null) return;
            if (_coinText != null) _coinText.text = s.Coins.ToString();
            if (_gemText != null) _gemText.text = s.Gems.ToString();
        }
    }
}
