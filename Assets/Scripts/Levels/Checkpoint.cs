using Skybound.Audio;
using Skybound.SaveData;
using UnityEngine;

namespace Skybound.Levels
{
    /// <summary>
    /// A respawn anchor. First entry activates it, records an autosave checkpoint, and plays
    /// feedback. The level's <see cref="LevelInfo"/> supplies the level id stored in the save.
    /// </summary>
    [RequireComponent(typeof(Collider2D))]
    public class Checkpoint : MonoBehaviour
    {
        [SerializeField] private string _checkpointId;
        [SerializeField] private Transform _respawnPoint;
        [SerializeField] private string _activateSfxId = "checkpoint";

        private bool _activated;

        private void Reset() => GetComponent<Collider2D>().isTrigger = true;

        private void OnTriggerEnter2D(Collider2D other)
        {
            if (_activated || !other.CompareTag("Player"))
            {
                return;
            }

            _activated = true;
            Vector3 pos = _respawnPoint != null ? _respawnPoint.position : transform.position;
            string levelId = LevelInfo.CurrentLevelId;

            if (SaveSystem.HasInstance)
            {
                SaveSystem.Instance.RecordCheckpoint(_checkpointId, pos, levelId);
            }

            if (AudioManager.HasInstance)
            {
                AudioManager.Instance.PlaySfx(_activateSfxId, transform.position);
            }
        }
    }
}
