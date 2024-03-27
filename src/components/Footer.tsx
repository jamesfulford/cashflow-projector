import Alert from "react-bootstrap/esm/Alert";
import Button from "react-bootstrap/esm/Button";
import useLocalStorage from "use-local-storage";

export const Footer = () => {
  const [cookieBannerAcknowledged, setCookieBannerAcknowledged] =
    useLocalStorage("cookie-banner-acknowledged", false);

  if (cookieBannerAcknowledged) return null;

  return (
    <Alert
      variant="white"
      className="fixed-bottom mb-0 border-top d-flex justify-content-between align-items-center"
      style={{ paddingRight: "60px !important", backgroundColor: "white" }}
    >
      <span>
        We use one cookie to track your behavior for the sole purpose of
        improving our product. No financial numbers are recorded. By continuing,
        you consent to this tracking.
      </span>
      <Button
        variant="primary"
        onClick={() => setCookieBannerAcknowledged(true)}
      >
        Noted, thanks.
      </Button>
    </Alert>
  );
};
