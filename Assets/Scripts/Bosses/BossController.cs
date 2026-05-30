using System;
using System.Collections;
using System.Collections.Generic;
using Skybound.Combat;
using Skybound.Core;
using UnityEngine;

namespace Skybound.Bosses
{
    /// <summary>
    /// Phase-based boss orchestrator for the World 1 boss. Health thresholds drive phase
    /// transitions; each phase owns an attack pattern pool and a music stem. Transitions
    /// trigger a cinematic beat (invulnerable, visual transformation, environmental
    /// destruction hook) before resuming combat. Built on the same FSM philosophy as the
    /// regular enemies but with a scripted pattern sequencer for authored fights.
    /// </summary>
    [RequireComponent(typeof(Health))]
    public class BossController : MonoBehaviour
    {
        [Serializable]
        public class Phase
        {
            public string Name = "Phase";
            [Range(0f, 1f)] public float HealthThreshold = 0.66f;
            public List<BossAttack> Attacks = new List<BossAttack>();
            public string MusicStemId;
            [Tooltip("Played once on entering this phase (transformation, roar, arena change).")]
            public GameObject TransitionVfx;
            public float TransitionInvulnTime = 2f;
        }

        [SerializeField] private string _bossName = "Verdant Colossus";
        [SerializeField] private List<Phase> _phases = new List<Phase>();
        [SerializeField] private Transform _player;

        private Health _health;
        private int _phaseIndex = -1;
        private bool _transitioning;
        private bool _active;
        private GameTimer _attackTimer;
        private int _attackCursor;

        public event Action<int, Phase> PhaseChanged;
        public event Action<string> BossIntroStarted;
        public event Action Defeated;

        private void Awake()
        {
            _health = GetComponent<Health>();
            _health.HealthChanged += OnHealthChanged;
            _health.Died += OnDied;
        }

        /// <summary>Called by the arena trigger when the player enters the boss room.</summary>
        public void BeginEncounter()
        {
            if (_active)
            {
                return;
            }

            StartCoroutine(IntroThenFight());
        }

        private IEnumerator IntroThenFight()
        {
            GameStateMachine.Instance.Set(GameState.BossIntro);
            BossIntroStarted?.Invoke(_bossName);
            // Cinematic intro window; camera framing + nameplate handled by listeners.
            yield return new WaitForSeconds(3f);

            GameStateMachine.Instance.Set(GameState.Playing);
            _active = true;
            EnterPhase(0);
        }

        private void Update()
        {
            if (!_active || _transitioning || !GameStateMachine.Instance.IsPlayable)
            {
                return;
            }

            if (_attackTimer.Tick(Time.deltaTime))
            {
                FireNextAttack();
            }
        }

        private void EnterPhase(int index)
        {
            _phaseIndex = index;
            Phase phase = _phases[index];
            _attackCursor = 0;
            _attackTimer.Start(1.0f);
            PhaseChanged?.Invoke(index, phase);
        }

        private void FireNextAttack()
        {
            Phase phase = _phases[_phaseIndex];
            if (phase.Attacks.Count == 0)
            {
                _attackTimer.Start(2f);
                return;
            }

            BossAttack attack = phase.Attacks[_attackCursor % phase.Attacks.Count];
            _attackCursor++;

            float recovery = attack != null
                ? attack.Execute(transform, _player)
                : 2f;

            _attackTimer.Start(Mathf.Max(0.4f, recovery));
        }

        private void OnHealthChanged(float current, float max)
        {
            if (!_active || _transitioning)
            {
                return;
            }

            float ratio = max > 0f ? current / max : 0f;
            int target = _phaseIndex;
            for (int i = _phaseIndex + 1; i < _phases.Count; i++)
            {
                if (ratio <= _phases[i].HealthThreshold)
                {
                    target = i;
                }
            }

            if (target > _phaseIndex)
            {
                StartCoroutine(TransitionTo(target));
            }
        }

        private IEnumerator TransitionTo(int index)
        {
            _transitioning = true;
            Phase phase = _phases[index];

            if (phase.TransitionVfx != null)
            {
                Instantiate(phase.TransitionVfx, transform.position, Quaternion.identity);
            }

            // Brief invulnerable, theatrical beat between phases.
            yield return new WaitForSeconds(phase.TransitionInvulnTime);

            EnterPhase(index);
            _transitioning = false;
        }

        private void OnDied()
        {
            _active = false;
            StopAllCoroutines();
            Defeated?.Invoke();
            GameStateMachine.Instance.Set(GameState.Victory);
        }

        private void OnDestroy()
        {
            if (_health != null)
            {
                _health.HealthChanged -= OnHealthChanged;
                _health.Died -= OnDied;
            }
        }
    }

    /// <summary>Strategy base for a single boss attack pattern. Returns recovery seconds.</summary>
    public abstract class BossAttack : ScriptableObject
    {
        public abstract float Execute(Transform boss, Transform player);
    }
}
