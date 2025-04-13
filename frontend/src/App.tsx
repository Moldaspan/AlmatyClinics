import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
    BarChartOutlined,
    EnvironmentOutlined, PlusOutlined,
} from '@ant-design/icons';
import HospitalMap from "./components/map/hospitalMap";
import AnalyticsPage from './components/analytics/AnalyticsPage';
import './App.css';
import HospitalDemandPage from "./components/hospitalDemand/HospitalDemandPage";
import ChatBot from './components/chatbot/ChatBot';
import { fetchHospitals } from './api/hospitalsApi';
import { Hospital } from './types/Hospital';

const { Content, Sider } = Layout;

const App = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);

    useEffect(() => {
        fetchHospitals("Все районы").then(setHospitals);
    }, []);

    return (
        <Router>
            <Layout style={{ minHeight: '100vh' }}>
                <Sider
                    breakpoint="lg"
                    collapsedWidth="80"
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                    style={{ background: '#001529' }}
                >
                    <div className="logo" style={{ color: "#fff", textAlign: "center", padding: "16px" }}>
                        {collapsed ? "🏥" : "🏥 HealthMap"}
                    </div>
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
                        <Menu.Item key="1" icon={<EnvironmentOutlined />}>
                            <NavLink to="/">Карта клиник</NavLink>
                        </Menu.Item>
                        <Menu.Item key="2" icon={<BarChartOutlined />}>
                            <NavLink to="/analytics">Аналитика</NavLink>
                        </Menu.Item>
                        <Menu.Item key="3" icon={<PlusOutlined />}>
                            <NavLink to="/hospital-demand">Нужда в клиниках</NavLink>
                        </Menu.Item>
                    </Menu>
                </Sider>

                <Layout>
                    <Content style={{ margin: '16px' }}>
                        <div>
                            <Routes>
                                <Route path="/" element={<HospitalMap />} />
                                <Route path="/analytics" element={<AnalyticsPage />} />
                                <Route path="/hospital-demand" element={<HospitalDemandPage />} />
                            </Routes>
                        </div>
                    </Content>
                </Layout>
            </Layout>
            <ChatBot hospitals={hospitals} />
        </Router>
    );
};

export default App;
