import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Grocery App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: GroceryPage(),
    );
  }
}

class GroceryPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Grocery Finder'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Search Bar
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: TextField(
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Search for items',
                  suffixIcon: Icon(Icons.search),
                ),
              ),
            ),

            // Category Buttons
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: Wrap(
                spacing: 8.0,
                runSpacing: 4.0,
                children: [
                  CategoryButton(label: 'Fruits'),
                  CategoryButton(label: 'Vegetables'),
                  CategoryButton(label: 'Dairy'),
                  CategoryButton(label: 'Bakery'),
                  CategoryButton(label: 'Snacks'),
                ],
              ),
            ),

            // Recommendations Section
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: Text(
                'Recommended Stores',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
            Expanded(
              child: ListView(
                children: [
                  StoreRecommendation(
                    storeName: 'Fresh Market',
                    storeImage: 'https://via.placeholder.com/150',
                  ),
                  StoreRecommendation(
                    storeName: 'Healthy Foods',
                    storeImage: 'https://via.placeholder.com/150',
                  ),
                  StoreRecommendation(
                    storeName: 'Organic Corner',
                    storeImage: 'https://via.placeholder.com/150',
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class CategoryButton extends StatelessWidget {
  final String label;

  const CategoryButton({required this.label});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () {
        // Handle button press
      },
      child: Text(label),
    );
  }
}

class StoreRecommendation extends StatelessWidget {
  final String storeName;
  final String storeImage;

  const StoreRecommendation({
    required this.storeName,
    required this.storeImage,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.symmetric(vertical: 8.0),
      child: ListTile(
        leading: Image.network(
          storeImage,
          width: 60,
          height: 60,
          fit: BoxFit.cover,
        ),
        title: Text(storeName),
        onTap: () {
          // Handle store tap
        },
      ),
    );
  }
}