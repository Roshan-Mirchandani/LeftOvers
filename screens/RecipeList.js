import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";

function RecipeList({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [recipesArray, setRecipeArray] = useState(null);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false); // idea behind this, turn true when filled out search and then move search bar top and add results after, do the activityloader thing with this
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPageUrl, setNextPageUrl] = useState(null); // shidfhewsi
  const [changingPage, setChangingPage] = useState(false);

  const [textInputValue, setTextInputValue] = useState("");
  const [queryText, changeQueryText] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");
  let textInputValueArray = [];
  let mergingInputText = "";

  //function to split ingredient list into array and then concatenate query
  const handleSearch = () => {
    textInputValueArray = textInputValue.split(" ");
    if (textInputValueArray.length == 1) {
      changeQueryText(textInputValueArray[0]);
    } else {
      for (var i = 0; i < textInputValueArray.length - 1; i++) {
        mergingInputText += textInputValueArray[i] + "%20";
      }
      mergingInputText += textInputValueArray[i];
      changeQueryText(mergingInputText);
      setIsSearching(true);
    }
    setIsLoading(false);
  };

  //function to render recipe array in list form, used in flatlist
  const renderRecipeInfo = ({ item }) => {
    return (
      <View style={styles.box1}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("RecipeDetails", { recipe: item.recipe })
          }
        >
          <Image source={{ uri: item.recipe.image }} style={styles.images} />
        </TouchableOpacity>
        <Text>{item.recipe.label}</Text>
      </View>
    );
  };

  //Button function
  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  //fetches data for current page
  useEffect(() => {
    fetchData();
  }, [queryText, currentPage]);

  const fetchData = async () => {
    console.log("fetch 1");
    const apiKey = "ace5596b42954a08f5296bb23f3d4ca9";
    const apiAppID = "903207ca";
    const query = queryText;
    setCurrentSearch(queryText);
    try {
      const response = await fetch(
        `https://api.edamam.com/api/recipes/v2?type=public&q=${query}&app_id=${apiAppID}&app_key=${apiKey}`
      );
      const jsonData = await response.json();

      if (currentSearch == queryText) {
        console.log("no diff");
        if (currentPage == 1) {
          setRecipeArray(jsonData.hits);
        } else {
          if (currentPage == 2) {
            setNextPageUrl(jsonData._links.next.href);
          }
          setChangingPage(true);
        }
        setIsLoading(false);
      } else {
        console.log("diff");
        setCurrentPage(1);
        setRecipeArray(jsonData.hits);
      }
    } catch (error) {
      setError(error);
      setIsLoading(false);
    }
  };

  //NEXT PAGE SHIT - need to assign recipe to this and figure out how it works with flatlist
  useEffect(() => {
    if (changingPage) {
      fetchChangePage();
    }
  }, [changingPage]);
  const fetchChangePage = async () => {
    console.log("fetch 2");
    try {
      let allRecipesArray = [...recipesArray];
      let addedArray = [];
      let nextPageLink = nextPageUrl;
      response = await fetch(nextPageLink);
      jsonData = await response.json();
      addedArray = [...jsonData.hits];
      allRecipesArray = [...allRecipesArray, ...addedArray];
      setNextPageUrl(jsonData._links.next.href);

      setRecipeArray(allRecipesArray);
    } catch (error) {
      setError(error.message);
    }
    setChangingPage(false);
  };

  //RENDERS EVERYTHING
  return (
    <SafeAreaView style={styles.wholeContainer}>
      {isSearching == false ? (
        <View>
          <TextInput
            style={styles.centreSearch}
            placeholder="Input just ingredient names with spaces in between thanks!"
            onChangeText={setTextInputValue}
            value={textInputValue}
            onSubmitEditing={handleSearch}
          />
        </View>
      ) : isLoading ? (
        <ActivityIndicator />
      ) : (
        <View style={styles.resultContainer}>
          <View>
            <TextInput
              placeholder="Input just ingredient names with spaces in between thanks!"
              onChangeText={setTextInputValue}
              value={textInputValue}
              onSubmitEditing={handleSearch}
            />
            <Text>FILTERS</Text>
          </View>
          <View style={styles.listContainer}>
            <FlatList
              data={recipesArray}
              renderItem={renderRecipeInfo}
              numColumns={2}
            />
            <View style={styles.button}>
              <TouchableOpacity onPress={nextPage}>
                <Text>More Ingredients</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  box1: {
    width: "50%",
    height: 200,
    backgroundColor: "pink",
  },
  images: {
    width: 150,
    height: 150,
  },
  centreSearch: {
    marginTop: "30%",
    borderColor: "red",
    borderWidth: 3,
  },
  button: {
    backgroundColor: "red",
    height: 100,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  listContainer: {
    marginBottom: 90,
  },
  resultContainer: {
    flex: 1,
  },
  wholeContainer: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    flex: 1,
  },
  next: { right: 10 },
});
export default RecipeList;

/* data.hits[1].recipe.dishType 

console.log(data._links.next.href);

*/
