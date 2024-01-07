import { Header } from "./components/Header";
import { PlanContainer } from "./pages/plan/PlanContainer";
import { Footer } from "./components/Footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={true} />
      <div
        className="d-flex flex-column justify-content-between"
        style={{ height: "100vh", width: "100vw" }}
      >
        <Header />
        <div style={{ minHeight: "85vh" }}>
          <PlanContainer />
        </div>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}

export default App;
