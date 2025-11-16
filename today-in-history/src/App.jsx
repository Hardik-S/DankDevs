import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

const getTodayPath = () => {
  const today = new Date();
  return {
    label: DATE_FORMATTER.format(today),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };
};

export default function App() {
  const { label: todayLabel, month, day } = useMemo(() => getTodayPath(), []);
  const [fact, setFact] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchFact = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`https://history.muffinlabs.com/date/${month}/${day}`);

      if (!response.ok) {
        throw new Error('Unable to fetch a fact right now.');
      }

      const payload = await response.json();
      const events = payload?.data?.Events ?? [];

      if (!events.length) {
        throw new Error('No historical events were found for this date.');
      }

      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setFact(randomEvent);
    } catch (err) {
      setError(err.message || 'Something went wrong while grabbing a fact.');
      setFact(null);
    } finally {
      setIsLoading(false);
    }
  }, [month, day]);

  useEffect(() => {
    fetchFact();
  }, [fetchFact]);

  return (
    <main className="app">
      <section className="card">
        <header className="card__header">
          <p className="eyebrow">Today is</p>
          <h1>{todayLabel}</h1>
          <p className="support">Here’s something interesting that also happened on this date:</p>
        </header>

        <div className="fact">
          {isLoading && <p className="fact__status">Loading a fun fact...</p>}
          {!isLoading && error && <p className="fact__status fact__status--error">{error}</p>}
          {!isLoading && !error && fact && (
            <>
              <p className="fact__year">{fact.year}</p>
              <p className="fact__text">{fact.text}</p>
              {fact.links?.length ? (
                <a className="fact__link" href={fact.links[0].link} target="_blank" rel="noreferrer">
                  Learn more ↗
                </a>
              ) : null}
            </>
          )}
        </div>

        <button className="refresh" onClick={fetchFact} disabled={isLoading}>
          {isLoading ? 'Fetching…' : 'Show me another fact'}
        </button>
      </section>

      <footer className="footer">
        <p>
          Powered by the public history API at{' '}
          <a href="https://history.muffinlabs.com/" target="_blank" rel="noreferrer">
            history.muffinlabs.com
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
