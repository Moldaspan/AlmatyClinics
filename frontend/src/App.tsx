import React, {useState} from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Layout, Menu, Breadcrumb } from 'antd';
import {
    BarChartOutlined,
    EnvironmentOutlined,
} from '@ant-design/icons';
import HospitalMap from "./components/map/hospitalMap";
import AnalyticsPage from './components/analytics/AnalyticsPage';
import './App.css';

const { Header, Content, Footer, Sider } = Layout;

const App = () => {
    const [collapsed, setCollapsed] = useState(false);
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
                    </Menu>
                </Sider>

                <Layout>
                    {/*<Header*/}
                    {/*    style={{*/}
                    {/*        background: '#fff',*/}
                    {/*        padding: 0,*/}
                    {/*        textAlign: 'center',*/}
                    {/*        fontSize: 20,*/}
                    {/*        boxShadow: '0 2px 8px #f0f1f2',*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    Городская карта клиник и аналитика*/}
                    {/*</Header>   */}
                    <Content style={{ margin: '16px' }}>
                        {/*<Breadcrumb style={{ margin: '16px 0' }}>*/}
                        {/*    <Breadcrumb.Item>*/}
                        {/*        <NavLink to="/">Главная</NavLink>*/}
                        {/*    </Breadcrumb.Item>*/}
                        {/*    <Breadcrumb.Item>*/}
                        {/*        <NavLink to="/analytics">Аналитика</NavLink>*/}
                        {/*    </Breadcrumb.Item>*/}
                        {/*</Breadcrumb>*/}
                        <div>
                            <Routes>
                                <Route path="/" element={<HospitalMap />} />
                                <Route path="/analytics" element={<AnalyticsPage />} />
                            </Routes>
                        </div>
                    </Content>
                    {/*<Footer style={{ textAlign: 'center' }}>*/}
                    {/*    HealthMap ©2025 Created by YourName*/}
                    {/*</Footer>*/}
                </Layout>
            </Layout>
        </Router>
    );
};

export default App;
