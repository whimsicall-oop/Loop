using System;
using System.Collections.Generic;
using Skybound.Core;
using Skybound.SaveData;
using UnityEngine;

namespace Skybound.Systems
{
    public enum AchievementCategory { Exploration, Combat, Speedrun, Collection, Boss }

    [CreateAssetMenu(menuName = "Skybound/Achievement", fileName = "Achievement")]
    public class AchievementDefinition : ScriptableObject
    {
        public string Id;
        public string Title;
        [TextArea] public string Description;
        public AchievementCategory Category;
        public Sprite Icon;
        [Tooltip("Maps to the platform achievement id (Steam/PSN/Xbox) for the storefront layer.")]
        public string PlatformId;
        public bool Hidden;
    }

    /// <summary>
    /// Tracks achievement unlocks, persists them to the save model, raises an event for the
    /// toast UI, and forwards to the platform layer (Steamworks/PSN/Xbox/Game Center) via a
    /// pluggable <see cref="IPlatformAchievements"/> so the core stays storefront-agnostic.
    /// </summary>
    public class AchievementSystem : Singleton<AchievementSystem>
    {
        [SerializeField] private List<AchievementDefinition> _achievements = new List<AchievementDefinition>();

        private readonly Dictionary<string, AchievementDefinition> _byId = new Dictionary<string, AchievementDefinition>();

        public IPlatformAchievements Platform { get; set; }
        public event Action<AchievementDefinition> Unlocked;

        protected override void OnSingletonAwake()
        {
            foreach (var a in _achievements)
            {
                if (a != null && !string.IsNullOrEmpty(a.Id)) _byId[a.Id] = a;
            }
        }

        public bool IsUnlocked(string id)
        {
            SaveModel s = SaveSystem.HasInstance ? SaveSystem.Instance.Active : null;
            return s != null && s.UnlockedAchievements.Contains(id);
        }

        public void Unlock(string id)
        {
            if (!_byId.TryGetValue(id, out var def) || IsUnlocked(id))
            {
                return;
            }

            SaveModel s = SaveSystem.Instance.Active;
            s.UnlockedAchievements.Add(id);
            SaveSystem.Instance.Save();

            Platform?.Report(def.PlatformId);
            Unlocked?.Invoke(def);
        }
    }

    /// <summary>Storefront bridge; implemented per platform in the build/integration layer.</summary>
    public interface IPlatformAchievements
    {
        void Report(string platformId);
    }
}
