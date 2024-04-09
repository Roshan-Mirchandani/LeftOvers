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
        <Text style={styles.boxText}>{item.recipe.label}</Text>
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
        //i.e if the user still hasnt changed the search input
        if (currentPage == 1) {
          setRecipeArray(jsonData.hits); //if on first page, set the first 20 recipes for recipe array
        } else {
          if (currentPage == 2) {
            setNextPageUrl(jsonData._links.next.href); //set this for fetchChangePage
          }
          setChangingPage(true);
        }
        setIsLoading(false);
      } else {
        //if the user changes the search input
        setCurrentPage(1); //reset page number
        setRecipeArray(jsonData.hits); //reset recipe arrays
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
    try {
      let allRecipesArray = [...recipesArray];
      let addedArray = [];
      let nextPageLink = nextPageUrl;
      response = await fetch(nextPageLink);
      jsonData = await response.json();
      addedArray = [...jsonData.hits];
      allRecipesArray = [...allRecipesArray, ...addedArray]; //combine old recipes and new recipes
      setNextPageUrl(jsonData._links.next.href); //set this again if next page has to be generated

      setRecipeArray(allRecipesArray); // set this to have all recipes
    } catch (error) {
      setError(error.message);
    }
    setChangingPage(false);
  };

  //RENDERS EVERYTHING
  return (
    <View style={styles.wholeContainer}>
      {isSearching == false ? (
        <View style={styles.searchContainer}>
          <Text style={styles.text}>
            Input just ingredient names with spaces in between thanks!
          </Text>
          <TextInput
            style={styles.centreSearch}
            placeholder="..."
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
              style={styles.topSearch}
              onChangeText={setTextInputValue}
              value={textInputValue}
              onSubmitEditing={handleSearch}
            />
            <Text></Text>
          </View>
          <View style={styles.listContainer}>
            <FlatList
              data={recipesArray}
              renderItem={renderRecipeInfo}
              numColumns={2}
            />
            <View style={styles.button}>
              <TouchableOpacity onPress={nextPage}>
                <Text style={styles.buttonText}>More Recipes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box1: {
    width: "48%",
    height: 220,
    borderWidth: 3,
    borderColor: "#445F48",
    borderRadius: 10,
    margin: "1%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#729B79",
  },
  boxText: {
    color: "#F5E2C8",
    fontSize: 14,
  },
  images: {
    width: 150,
    height: 150,
    borderRadius: 10,
    borderColor: "#F5E2C8",
    borderWidth: 3,
  },
  centreSearch: {
    marginBottom: "40%",
    borderColor: "#729B79",
    height: 50,
    width: "95%",
    borderWidth: 3,
    fontSize: 20,
    color: "#729B79",
    borderRadius: 10,
    padding: 10,
  },
  topSearch: {
    borderColor: "#729B79",
    height: 50,
    width: "100%",
    borderWidth: 3,
    fontSize: 20,
    color: "#729B79",
    borderRadius: 10,
    alignItems: "center",
    padding: 10,
  },
  button: {
    backgroundColor: "#445F48",
    borderColor: "#4F404C",
    borderWidth: 3,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    justifyContent: "center",
    alignItems: "center",
    fontSize: 30,
    color: "#F5E2C8",
  },
  listContainer: {
    marginBottom: 90,
    justifyContent: "space-evenly",
  },
  resultContainer: {
    flex: 1,
  },
  searchContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#729B79",
    fontSize: 24,
    marginHorizontal: "3%",
  },
  wholeContainer: {
    flex: 1,
    backgroundColor: "#F5E2C8",
  },
  next: { right: 10 },
});
export default RecipeList;
