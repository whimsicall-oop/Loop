using System;
using UnityEngine;

namespace Skybound.Enemies
{
    /// <summary>
    /// Decouples "an enemy died" from the systems that care (XP gain, coin drops, kill
    /// achievements, quest counters). The death state reports here; subscribers react.
    /// A static broker is appropriate because death is a global, fire-and-forget signal.
    /// </summary>
    public static class EnemyDeathBroker
    {
        /// <summary>(enemy, deathPosition) — fired exactly once per enemy.</summary>
        public static event Action<EnemyController, Vector3> EnemyDied;

        public static void Report(EnemyController enemy)
        {
            EnemyDied?.Invoke(enemy, enemy.transform.position);
        }
    }
}
