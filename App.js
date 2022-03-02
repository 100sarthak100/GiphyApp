/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useEffect, useCallback } from 'react';

import {
  SafeAreaView,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
  Image,
  useColorScheme,
  LayoutAnimation,
  UIManager,
  Platform,
  ActivityIndicator,
  View,
  Dimensions,
  FlatList,
  TouchableOpacity,
  TextInput
} from 'react-native';


function widthPercent(x) {
  let a = ((x * 100) / Dimensions.get('window')?.width)
  return a + '%';
}

function heightPercent(x) {
  let a = ((x * 100) / Dimensions.get('window')?.height)
  return a + '%';
}

let API_KEY = "SxuMJwcYIy58ZF254sQHgyu9yONAuE0r"
let BASE_API = "api.giphy.com/v1/gifs/"

const App = () => {

  const [trendingObj, setTrendingObj] = useState({
    loading: true, error: "", data: []
  })

  const [featuredObj, setFeaturedgObj] = useState({
    loading: true, error: "", data: [], pageOffset: 1
  })

  const [searchObj, setSearchObj] = useState({
    loading: true, error: "", data: []
  })

  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("")

  // useEffect(() => {
  //   console.log("featuredObj", featuredObj?.data)
  // }, [featuredObj?.data])

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    console.log("call api")

    fetchTrendingData()
    fetchFeaturedData()
  }, [])

  const fetchTrendingData = async () => {
    try {
      const resp = await fetch(`https://${BASE_API}trending?api_key=${API_KEY}`, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': "application/json"
        },
      });
      const data = await resp.json();
      setTrendingObj({
        ...trendingObj,
        loading: false,
        data: data?.data
      })
      console.log("trending", data)
    } catch (error) {
      console.log(error)
      setTrendingObj({
        ...trendingObj,
        error: error
      })
    }
  };

  const fetchFeaturedData = async (page = 5) => {
    try {
      const resp = await fetch(`https://${BASE_API}trending?api_key=${API_KEY}&rating=pg&limit=50&offset=${page}`, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': "application/json"
        },
      });
      const data = await resp.json();
      let tempData = [...featuredObj?.data]
      setFeaturedgObj({
        ...featuredObj,
        loading: false,
        data: [...tempData, ...data?.data]
      })
      console.log("featured", data)
    } catch (error) {
      console.log(error)
      setFeaturedgObj({
        ...featuredObj,
        error: error
      })
    }
  };

  function RenderTrendingList({ item }) {
    return (
      <TouchableOpacity style={styles.trendingCards}>
        <Image
          resizeMode='cover'
          style={{ width: '100%', height: '100%', overlayColor: 'white', overflow: 'hidden', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}
          source={{ uri: item?.images?.preview_gif?.url }}
        />
      </TouchableOpacity>
    )
  }

  const handleSearch = async (val) => {
    console.log("search", val)
    let url = `https://${BASE_API}search?api_key=${API_KEY}&q=${val}`

    try {
      const resp = await fetch(url, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': "application/json"
        },
      });
      const data = await resp.json();
      setSearchObj({
        ...searchObj,
        loading: false,
        data: data?.data
      })
      console.log(data)
    } catch (error) {
      console.log(error)
      setSearchObj({
        ...searchObj,
        error: error
      })
    }
  }

  function debounceFunc(func, delay) {
    let timerInstance;

    return function (...args) {
      let context = this;
      clearTimeout(timerInstance)
      timerInstance = setTimeout(() => {
        func.apply(context, args)
      }, delay)
    }
  }

  const enhancedFunc = useCallback(debounceFunc(handleSearch, 1000), []);

  function onChangeText(val) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSearch(val)
    enhancedFunc(val)
  }

  useEffect(() => {
    if (search === "" && setSearch?.loading === false) {
      setSearchObj({
        ...searchObj,
        loading: true
      })
    }
  }, [search])

  const headerComponent = React.memo(() => {
    return (
      <View style={{ display: 'flex', backgroundColor: 'white' }}>
        <View style={styles.section1}>
          <View style={{ display: 'flex', backgroundColor: 'white', justifyContent: 'center', alignItems: 'flex-start', width: '100%', paddingVertical: 5 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>Trending Giphys</Text>
          </View>
          {
            trendingObj?.loading ? (
              <View style={{ flex: 1, marginTop: 30 }}>
                <ActivityIndicator size={'large'} />
              </View>
            ) : (
              trendingObj?.error ? (
                <Text>{trendingObj?.error}</Text>
              ) : (
                <FlatList
                  data={trendingObj?.data?.length ? trendingObj?.data : []}
                  keyExtractor={(item, index) => item?.id ? `${item?.id}${index}` : index}
                  renderItem={RenderTrendingList}
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ backgroundColor: 'white', margin: 0, padding: 0 }}
                />
              )
            )
          }
        </View>
        <View style={{ display: 'flex', backgroundColor: 'white', justifyContent: 'center', alignItems: 'flex-start', width: '100%', paddingVertical: 5, paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>Featured Giphys</Text>
        </View>
      </View>
    )
  })

  const RenderVerticalList = useCallback(({ item }) => {
    return (
      <TouchableOpacity style={styles.featuredCards}>
        <Image
          resizeMode='cover'
          style={{ width: '100%', height: '100%', borderRadius: 5, overlayColor: 'white', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}
          source={{ uri: item?.images?.preview_gif?.url }}
        />
      </TouchableOpacity>
    )
  }, [])

  function clearSearch() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSearch("")
    if (searchObj?.loading === false) {
      setSearchObj({
        ...searchObj,
        loading: true
      })
    }
  }

  const onRefresh = React.useCallback(() => {
    console.log("refresh")
    fetchTrendingData()
    fetchFeaturedData()

    setRefreshing(true);
  }, []);

  useEffect(() => {
    if (!featuredObj?.loading && refreshing) {
      setRefreshing(false)
    }
  }, [featuredObj?.loading, refreshing])

  const skeltonData = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {},]

  const handleLoadMoreFeaturedGifs = () => {
    console.log("call pagination api")
    // TODO
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View></View>
        <View>
          <TextInput
            onChangeText={onChangeText}
            value={search}
            placeholder={"Search Gifs"}
            placeholderTextColor="gray"
            style={{ borderWidth: 1, color: 'gray', paddingHorizontal: 20, fontSize: 20, borderRadius: 5, width: 250, paddingVertical: 5, borderColor: 'gray' }}
          />
        </View>
        {
          search ? (
            <TouchableOpacity onPress={clearSearch} style={{ marginLeft: 20, backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 10 }}>
              <Text style={{ fontSize: 20, color: 'black' }}>X</Text>
            </TouchableOpacity>
          ) : null
        }
      </View>
      {
        search ? (
          !searchObj?.loading ? (
            searchObj?.error ? (
              <Text>{searchObj?.error}</Text>
            ) : (
              searchObj?.data?.length ? (
                <FlatList
                  data={searchObj?.data?.length ? searchObj?.data : skeltonData}
                  renderItem={RenderVerticalList}
                  keyExtractor={(item, index) => item?.id ? `${item?.id}${index}` : index}
                  horizontal={false}
                  numColumns={2}
                  showsVerticalScrollIndicator={false}
                  columnWrapperStyle={{ backgroundColor: 'white', marginHorizontal: 16, justifyContent: 'space-between', marginVertical: 10 }}
                  contentContainerStyle={{ backgroundColor: 'white', margin: 0, padding: 0 }}
                />
              ) : null
            )
          ) : (
            <View style={{ flex: 1, marginTop: 100 }}>
              <ActivityIndicator size={'large'} />
            </View>
          )
        ) : (
          <FlatList
            data={featuredObj?.data?.length ? featuredObj?.data : skeltonData}
            renderItem={RenderVerticalList}
            keyExtractor={(item, index) => item?.id ? `${item?.id}${index}` : index}
            horizontal={false}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{ backgroundColor: 'white', marginHorizontal: 16, justifyContent: 'space-between' }}
            contentContainerStyle={{ backgroundColor: 'white', margin: 0, padding: 0 }}
            ListHeaderComponent={headerComponent}
            ListHeaderComponentStyle={{ display: 'flex', flex: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["black", "orange", "red", "green"]}
                progressBackgroundColor="white"
                progressViewOffset={50}
              />
            }
            onEndReachedThreshold={3}
            onEndReached={handleLoadMoreFeaturedGifs}
          />
        )
      }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  header: {
    display: 'flex',
    height: 70,
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10
  },
  section1: {
    display: 'flex',
    // height: heightPercent(200),
    // height: 200,
    backgroundColor: 'white',
    paddingLeft: widthPercent(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20
  },
  trendingCards: {
    display: 'flex',
    width: 150,
    height: 100,
    backgroundColor: 'lightgray',
    marginRight: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    overlayColor: 'white',
  },
  featuredCards: {
    display: 'flex',
    width: '48%',
    height: 100,
    backgroundColor: 'lightgray',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    // marginHorizontal: 5
  }
});

export default React.memo(App);
