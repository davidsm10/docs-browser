import { useEffect, useState } from "preact/hooks";
import "./setupView.css";
import { saveContent } from "../../content";

export default function SetupView(props: { onSetupDone: () => void }) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setup = async () => {
      try {
        await saveContent();
        props.onSetupDone();
      } catch (err) {
        setError(String(err));
      }
    };
    setup();
  }, []);
  return (
    <div className="setup-view">
      <div>
        <h1>Initial setup in progress</h1>
        <p>This is a one time setup</p>
        {error && (
          <p>
            <span class="error">Error: </span>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
