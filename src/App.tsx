import { Header } from "./components/Header";
import { PlanContainer } from "./pages/plan/PlanContainer";
import { Footer } from "./components/Footer";

function App() {
  return (
    <>
      <Header />
      <div style={{ minHeight: "85vh" }}>
        <PlanContainer />
      </div>
      <Footer />
    </>
  );
}

export default App;
