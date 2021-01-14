import React, {useState, useEffect, useCallback} from 'react';
import {FlatList, View} from 'react-native';
import LazyImage from '../../components/LazyImage';
import {Post, Header, Avatar, Name, Description, Loadin} from './styles';

export default function Feed() {
  const [feed, setFeed] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [viewable, setViewable] = useState([]);

  async function loadePage(pageNumber = page, shouldRefresh = false) {
    if (total && pageNumber > total) return;
    setLoading(true);

    const response = await fetch(
      `http://localhost:3000/feed?_expand=author&_limit=5&_page=${pageNumber}`,
    );
    const data = await response.json();
    const totalItems = response.headers.get('X-Total-Count');

    setTotal(Math.floor(totalItems / 5));
    setFeed(shouldRefresh ? data : [...feed, ...data]);
    setPage(pageNumber + 1);
    setLoading(false);
  }
  useEffect(() => {
    loadePage();
  }, []);

  async function refreshList() {
    setRefresh(true);

    await loadePage(1, true);

    setRefresh(false);
  }

  const handleViewableChange = useCallback(({changed}) => {
    setViewable(changed.map(({item}) => item.id));
  }, []);
  return (
    <View>
      <FlatList
        data={feed}
        keyExtractor={(post) => String(post.id)}
        onEndReached={() => loadePage()}
        onEndReachedThreshold={0.1}
        onRefresh={refreshList}
        refreshing={refresh}
        onViewableItemsChanged={handleViewableChange}
        viewabilityConfig={{
          viewAreaCoveragePercentThreshold: 20,
          minimalViewTime: 1,
        }}
        ListFooterComponent={loading && <Loadin />}
        renderItem={({item}) => (
          <Post>
            <Header>
              <Avatar source={{uri: item.author.avatar}} />
              <Name>{item.author.name}</Name>
            </Header>
            <LazyImage
              shouldLoad={viewable.includes(item.id)}
              aspectRatio={item.aspectRatio}
              smallSource={{uri: item.small}}
              source={{uri: item.image}}
            />
            <Description>
              <Name>{item.author.name}</Name> {item.description}
            </Description>
          </Post>
        )}
      />
    </View>
  );
}
