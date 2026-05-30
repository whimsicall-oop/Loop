using Skybound.Audio;
using Skybound.SaveData;
using Skybound.VFX;
using UnityEngine;

namespace Skybound.Items
{
    public enum CollectibleType { Coin, Gem, Relic, Artifact }

    /// <summary>
    /// A pickup placed in the world. Coins/Gems feed the economy; Relics/Artifacts are
    /// unique, tracked by id for completion stats and secret discovery. On collect it
    /// updates the save model, plays SFX + a burst, and disables itself. Unique items
    /// check the save so they cannot be double-collected after a checkpoint reload.
    /// </summary>
    [RequireComponent(typeof(Collider2D))]
    public class Collectible : MonoBehaviour
    {
        [SerializeField] private CollectibleType _type = CollectibleType.Coin;
        [SerializeField] private int _value = 1;
        [Tooltip("Unique id for Relics/Artifacts/secrets. Leave blank for fungible coins/gems.")]
        [SerializeField] private string _uniqueId;
        [SerializeField] private string _sfxId = "coin_pickup";
        [SerializeField] private string _vfxId = "coin_burst";

        private void Reset()
        {
            GetComponent<Collider2D>().isTrigger = true;
        }

        private void Start()
        {
            // Don't respawn already-collected unique items.
            if (_type is CollectibleType.Relic or CollectibleType.Artifact &&
                !string.IsNullOrEmpty(_uniqueId) && AlreadyCollected())
            {
                gameObject.SetActive(false);
            }
        }

        private void OnTriggerEnter2D(Collider2D other)
        {
            if (!other.CompareTag("Player"))
            {
                return;
            }

            Collect();
        }

        private void Collect()
        {
            SaveModel save = SaveSystem.HasInstance ? SaveSystem.Instance.Active : null;
            if (save != null)
            {
                switch (_type)
                {
                    case CollectibleType.Coin: save.Coins += _value; break;
                    case CollectibleType.Gem: save.Gems += _value; break;
                    case CollectibleType.Relic:
                        if (!save.CollectedRelics.Contains(_uniqueId)) save.CollectedRelics.Add(_uniqueId);
                        break;
                    case CollectibleType.Artifact:
                        if (!save.CollectedArtifacts.Contains(_uniqueId)) save.CollectedArtifacts.Add(_uniqueId);
                        break;
                }
            }

            if (AudioManager.HasInstance) AudioManager.Instance.PlaySfx(_sfxId, transform.position);
            if (VfxManager.HasInstance) VfxManager.Instance.Spawn(_vfxId, transform.position);

            gameObject.SetActive(false);
        }

        private bool AlreadyCollected()
        {
            SaveModel s = SaveSystem.Instance.Active;
            return s != null && (s.CollectedRelics.Contains(_uniqueId) || s.CollectedArtifacts.Contains(_uniqueId));
        }
    }
}
