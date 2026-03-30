if (process.env.NODE_ENV === 'test') {
    console.log(`TEST MODE DETECTED: Connecting to real_estate_test_db`);
    exports.config = {
        host: "localhost",
        port: 3306,
        user: "root",
        password: "Ibrahimcode18",
        database: "real_estate_test_db"
    }
} else {
    exports.config = {
        host: "localhost",
        port: 3306,
        user: "root",
        password: "Ibrahimcode18",
        database: "realestate_listings"
    }
}
