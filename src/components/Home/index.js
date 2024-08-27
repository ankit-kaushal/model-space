import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Row, Col, Input, Spin, Empty } from 'antd';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';

const { Search } = Input;

const Home = () => {
  const [modelSpaces, setModelSpaces] = useState([]);
  const [filteredSpaces, setFilteredSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const fetchModelSpaces = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/model-spaces`);
        setModelSpaces(response.data.data);
        setFilteredSpaces(response.data.data);
      } catch (err) {
        console.error('Error fetching model spaces:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchModelSpaces();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filtered = modelSpaces.filter((model) =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSpaces(filtered);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, modelSpaces]);

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Explore Model Spaces</h1>
      <Search
        placeholder="Search Model Spaces"
        value={searchTerm}
        onChange={handleSearchChange}
        className={styles.search_bar}
        allowClear
      />
      {loading ? (
        <div className={styles.loader}>
          <Spin size="large" />
        </div>
      ) : filteredSpaces.length > 0 ? (
        <Row gutter={[16, 16]} className={styles.card_container}>
          {filteredSpaces.map((model) => (
            <Col key={model.id} xs={24} sm={12} md={8} lg={6}>
              <Link to={`/model/${model.id}`}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={model.name}
                      src={model.avatar}
                      className={styles.avatar}
                    />
                  }
                  className={styles.card}
                >
                  <Card.Meta
                    title={model.name}
                    description={model.description}
                  />
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      ) : (
        <div className={styles.empty_state}>
          <Empty description="No Model Spaces Found" />
        </div>
      )}
    </div>
  );
};

export default Home;
