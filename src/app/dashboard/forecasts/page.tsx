import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import ForecastView from "@/components/forecast/forecast-view";

const ForecastPage = () => {
    return (
        <DashboardLayout>
            <ForecastView />
        </DashboardLayout>
    );
}

export default ForecastPage;