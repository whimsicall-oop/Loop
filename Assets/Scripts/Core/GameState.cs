using System;
using UnityEngine;

namespace Skybound.Core
{
    public enum GameState
    {
        Boot,
        MainMenu,
        Loading,
        Playing,
        Paused,
        Cutscene,
        BossIntro,
        GameOver,
        Victory
    }

    /// <summary>
    /// Central authority for high-level game state. Other systems subscribe to
    /// <see cref="StateChanged"/> rather than polling, keeping coupling low and
    /// transitions auditable. Handles time-scale side effects (pause / slow-mo).
    /// </summary>
    public class GameStateMachine : Singleton<GameStateMachine>
    {
        [SerializeField] private GameState _current = GameState.Boot;

        public GameState Current => _current;

        /// <summary>Fired with (previous, next) whenever the state changes.</summary>
        public event Action<GameState, GameState> StateChanged;

        public bool IsPlayable => _current == GameState.Playing || _current == GameState.BossIntro;

        public void Set(GameState next)
        {
            if (next == _current)
            {
                return;
            }

            GameState previous = _current;
            _current = next;

            ApplyTimeScale(next);
            StateChanged?.Invoke(previous, next);
        }

        public void TogglePause()
        {
            if (_current == GameState.Playing)
            {
                Set(GameState.Paused);
            }
            else if (_current == GameState.Paused)
            {
                Set(GameState.Playing);
            }
        }

        private static void ApplyTimeScale(GameState state)
        {
            Time.timeScale = state == GameState.Paused ? 0f : 1f;
        }
    }
}
