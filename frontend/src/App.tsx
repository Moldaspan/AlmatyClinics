import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import HospitalMap from "./components/map/hospitalMap";
import AnalyticsPage from "./components/analytics/AnalyticsPage";
import { Layout, Menu } from "antd";
import {
    BarChartOutlined,
    EnvironmentOutlined
} from "@ant-design/icons";
import "antd/dist/reset.css";
import "./App.css";

const { Header, Content, Sider } = Layout;

const App: React.FC = () => {
    return (
        <Router>
            <Layout style={{ minHeight: "100vh" }}>
                <Sider width={220} style={{ background: "#001529" }}>
                    <div className="logo">🏥 HealthMap</div>
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
                        <Menu.Item key="1" icon={<EnvironmentOutlined />}>
                            <NavLink to="/">Карта клиник</NavLink>
                        </Menu.Item>
                        <Menu.Item key="2" icon={<BarChartOutlined />}>
                            <NavLink to="/analytics">Аналитика</NavLink>
                        </Menu.Item>
                    </Menu>
                </Sider>

                <Layout>
                    <Header style={{ background: "#fff", padding: 0, textAlign: "center", fontSize: 20 }}>
                        Городская карта клиник и аналитика
                    </Header>
                    <Content style={{ margin: "16px", padding: 24, background: "#fff" }}>
                        <Routes>
                            <Route path="/" element={<HospitalMap />} />
                            <Route path="/analytics" element={<AnalyticsPage />} />
                        </Routes>
                    </Content>
                </Layout>
            </Layout>
        </Router>
    );
};

export default App;