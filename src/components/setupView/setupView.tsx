import { useEffect, useState } from "preact/hooks";
import "./setupView.css";
import { saveContent, type ProgressData } from "../../content";

export default function SetupView(props: { onSetupDone: () => void }) {
  const [fileInProgress, setFileInProgress] = useState<string>();
  const [fileProgress, setFileProgress] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  function onProgress(progressData: ProgressData) {
    setFileInProgress(progressData.file);
    setFileProgress(progressData.progress.toFixed(0));
  }

  useEffect(() => {
    const setup = async () => {
      try {
        await saveContent(onProgress);
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
        <h1>Initial setup</h1>
        {error ? (
          <div>
            <span class="error">Error: </span>
            {error}
          </div>
        ) : (
          <div>
            <label>
              <div>Unpacking {fileInProgress}:</div>
              <progress max={100} value={fileProgress}>
                {fileProgress + "%"}
              </progress>
            </label>
            {" " + fileProgress + "%"}
          </div>
        )}
      </div>
    </div>
  );
}
