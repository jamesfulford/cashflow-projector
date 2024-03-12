import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import useLocalStorage from "use-local-storage";

export const Footer = () => {
  const [cookieBannerAcknowledged, setCookieBannerAcknowledged] =
    useLocalStorage("cookie-banner-acknowledged", false);

  if (cookieBannerAcknowledged) return null;

  return (
    <Alert variant="secondary" className="fixed-bottom mb-0">
      We use one cookie to track your behavior for the sole purpose of improving
      our product. No financial numbers are recorded. By continuing, you consent
      to this tracking.{" "}
      <Button
        variant="outline-primary"
        onClick={() => setCookieBannerAcknowledged(true)}
      >
        Noted, thanks.
      </Button>
    </Alert>
  );
};
