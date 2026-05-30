using System;
using System.Collections.Generic;

namespace Skybound.Enemies.AI
{
    /// <summary>One node in an enemy's behaviour. Stateless logic, state lives on the owner.</summary>
    public interface IState
    {
        void Enter();
        void Tick(float deltaTime);
        void Exit();
    }

    /// <summary>
    /// A compact hierarchical-free FSM with declarative transitions. Chosen over a full
    /// behaviour-tree library for the shipping enemy roster because it is transparent,
    /// debuggable, and zero-allocation at runtime; the boss layers a scripted sequencer
    /// on top of the same primitive. Global ("any-state") transitions handle Hurt/Death.
    /// </summary>
    public class StateMachine
    {
        private readonly List<Transition> _transitions = new List<Transition>();
        private readonly List<Transition> _anyTransitions = new List<Transition>();

        public IState Current { get; private set; }

        private readonly struct Transition
        {
            public readonly IState From;
            public readonly IState To;
            public readonly Func<bool> Condition;

            public Transition(IState from, IState to, Func<bool> condition)
            {
                From = from;
                To = to;
                Condition = condition;
            }
        }

        public void SetInitial(IState state)
        {
            Current = state;
            state.Enter();
        }

        public void AddTransition(IState from, IState to, Func<bool> condition)
            => _transitions.Add(new Transition(from, to, condition));

        public void AddAnyTransition(IState to, Func<bool> condition)
            => _anyTransitions.Add(new Transition(null, to, condition));

        public void Tick(float deltaTime)
        {
            Transition? next = Evaluate();
            if (next.HasValue && next.Value.To != Current)
            {
                ChangeState(next.Value.To);
            }

            Current?.Tick(deltaTime);
        }

        private Transition? Evaluate()
        {
            foreach (var t in _anyTransitions)
            {
                if (t.Condition())
                {
                    return t;
                }
            }

            foreach (var t in _transitions)
            {
                if (t.From == Current && t.Condition())
                {
                    return t;
                }
            }

            return null;
        }

        private void ChangeState(IState to)
        {
            Current?.Exit();
            Current = to;
            Current.Enter();
        }

        public void ForceState(IState to) => ChangeState(to);
    }
}
