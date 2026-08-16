import { useEffect } from "preact/hooks";
import "./setupView.css";
import { saveContent } from "../../content";

export default function SetupView(props: { onSetupDone: () => void }) {
  useEffect(() => {
    const setup = async () => {
      await saveContent();
      props.onSetupDone();
    };
    setup();
  }, []);
  return <div>Decompressing, converting and saving docs</div>;
}
