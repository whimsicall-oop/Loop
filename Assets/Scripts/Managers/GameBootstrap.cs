using Skybound.Core;
using Skybound.Enemies;
using Skybound.Progression;
using Skybound.SaveData;
using UnityEngine;

namespace Skybound.Managers
{
    /// <summary>
    /// Composition root. Lives on a persistent object in the Boot scene and guarantees the
    /// core singletons exist and are wired before gameplay. Also bridges global gameplay
    /// signals to the systems that consume them (enemy death → XP + coins), so individual
    /// systems stay decoupled. This is the one place that "knows everyone".
    /// </summary>
    public class GameBootstrap : MonoBehaviour
    {
        [SerializeField] private bool _startInMainMenu = true;

        private void Awake()
        {
            // Touch singletons so they self-instantiate in a deterministic order.
            _ = GameStateMachine.Instance;
            _ = SaveSystem.Instance;
            _ = ProgressionSystem.Instance;

            EnemyDeathBroker.EnemyDied += OnEnemyDied;
        }

        private void Start()
        {
            GameStateMachine.Instance.Set(_startInMainMenu ? GameState.MainMenu : GameState.Playing);
        }

        private void OnEnemyDied(EnemyController enemy, Vector3 position)
        {
            if (enemy == null || enemy.Data == null)
            {
                return;
            }

            ProgressionSystem.Instance.GrantXp(enemy.Data.XpReward);

            SaveData.SaveModel save = SaveSystem.Instance.Active;
            if (save != null)
            {
                save.Coins += enemy.Data.CoinReward;
            }
        }

        private void OnDestroy()
        {
            EnemyDeathBroker.EnemyDied -= OnEnemyDied;
        }
    }
}
