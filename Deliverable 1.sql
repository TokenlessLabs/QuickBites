DROP TABLE IF EXISTS Payments;
DROP TABLE IF EXISTS RestImages;
DROP TABLE IF EXISTS RestCuisines;
DROP TABLE IF EXISTS UserPrefCuisines;
DROP TABLE IF EXISTS UserPrefRests;
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS Reservations;
DROP TABLE IF EXISTS Tables;
DROP TABLE IF EXISTS RestaurantStaff;
DROP TABLE IF EXISTS RestaurantAdmins;
DROP TABLE IF EXISTS Cuisines;
DROP TABLE IF EXISTS Restaurants;
DROP TABLE IF EXISTS Users;

-- ==========================
--  TABLE CREATION
-- ==========================

-- 1️ Users Table
CREATE TABLE Users(
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Username NVARCHAR(20) NOT NULL,
    Password NVARCHAR(16) NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    PhoneNum NVARCHAR(13) UNIQUE NOT NULL,
    Role NVARCHAR(10) CHECK (Role IN ('Customer','Admin','Staff')) NOT NULL,
    ProfilePic VARBINARY(MAX) NULL
);

-- 2️ Restaurants Table
CREATE TABLE Restaurants(
    RestaurantID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    Location NVARCHAR(300) NOT NULL,
    PhoneNum NVARCHAR(13) UNIQUE NOT NULL,
    OperatingHoursStart TIME NOT NULL,
    OperatingHoursEnd TIME NOT NULL,
    Status NVARCHAR(10) CHECK (Status IN ('Open','Closed')) NOT NULL DEFAULT ('Open'),
    ProfilePic VARBINARY(MAX) NULL
);

-- 3️ RestaurantAdmins Table
CREATE TABLE RestaurantAdmins (
    RestaurantID INT FOREIGN KEY REFERENCES Restaurants(RestaurantID) ON UPDATE CASCADE ON DELETE CASCADE,
    UserID INT FOREIGN KEY REFERENCES Users(UserID) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (RestaurantID, UserID)
);

-- 3️.5 RestaurantStaff Table
CREATE TABLE RestaurantStaff (
    RestaurantID INT FOREIGN KEY REFERENCES Restaurants(RestaurantID) ON UPDATE CASCADE ON DELETE CASCADE,
    UserID INT FOREIGN KEY REFERENCES Users(UserID) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (RestaurantID, UserID)
);

-- 4️ Tables Table
CREATE TABLE Tables(
    TableID INT IDENTITY(1,1) PRIMARY KEY,
    Capacity INT NOT NULL CHECK (Capacity > 0),
    Status NVARCHAR(10) CHECK (Status IN ('Reserved','Free','Occupied')) NOT NULL DEFAULT ('Free'),
    Description NVARCHAR(MAX),
    RestaurantID INT FOREIGN KEY REFERENCES Restaurants(RestaurantID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- 5️ Reservations Table
CREATE TABLE Reservations (
    ReservationID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID) ON UPDATE CASCADE ON DELETE CASCADE,
    TableID INT FOREIGN KEY REFERENCES Tables(TableID) ON UPDATE CASCADE ON DELETE SET NULL,
    Time DATETIME DEFAULT GETDATE() NOT NULL,
    Duration INT NOT NULL CHECK (Duration > 0),
    People INT NOT NULL CHECK (People > 0),
    Request NVARCHAR(MAX),
    Status NVARCHAR(10) NOT NULL DEFAULT 'Pending' 
        CHECK (Status IN ('Pending', 'Approved', 'Completed', 'Cancelled'))
);

-- 6️ Reviews Table
CREATE TABLE Reviews (
    ReviewID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID) ON UPDATE CASCADE ON DELETE SET NULL,
    RestaurantID INT FOREIGN KEY REFERENCES Restaurants(RestaurantID) ON UPDATE CASCADE ON DELETE CASCADE,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5) DEFAULT 1,
    Comment NVARCHAR(MAX) NULL
);

-- 7️ Cuisines Table
CREATE TABLE Cuisines(
    CuisineID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(MAX) NOT NULL
);

-- 8️ User Preferred Restaurants Table
CREATE TABLE UserPrefRests(
    UserID INT FOREIGN KEY REFERENCES Users(UserID) ON UPDATE CASCADE ON DELETE CASCADE,
    RestaurantID INT FOREIGN KEY REFERENCES Restaurants(RestaurantID) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (UserID, RestaurantID)
);

-- 9️ User Preferred Cuisines Table
CREATE TABLE UserPrefCuisines(
    UserID INT FOREIGN KEY REFERENCES Users(UserID) ON UPDATE CASCADE ON DELETE CASCADE,
    CuisineID INT FOREIGN KEY REFERENCES Cuisines(CuisineID) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (UserID, CuisineID)
);

-- 10 Restaurant Cuisines Table
CREATE TABLE RestCuisines(
    CuisineID INT FOREIGN KEY REFERENCES Cuisines(CuisineID) ON UPDATE CASCADE ON DELETE CASCADE,
    RestaurantID INT FOREIGN KEY REFERENCES Restaurants(RestaurantID) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (CuisineID, RestaurantID)
);

-- 1️1 Restaurant Images Table
CREATE TABLE RestImages(
    ImageID INT IDENTITY(1,1) PRIMARY KEY,
    RestaurantID INT FOREIGN KEY REFERENCES Restaurants(RestaurantID) ON UPDATE CASCADE ON DELETE CASCADE,
    Image VARBINARY(MAX) NULL
);

-- 1️2 Payments Table
CREATE TABLE Payments(
    PaymentID INT IDENTITY(1,1) PRIMARY KEY,
    ReservationID INT FOREIGN KEY REFERENCES Reservations(ReservationID) ON UPDATE CASCADE ON DELETE SET NULL,
    Amount INT NOT NULL CHECK (Amount > 0),
    PaymentDate DATETIME DEFAULT GETDATE() NOT NULL,
    Status NVARCHAR(10) NOT NULL CHECK (Status IN ('Pending', 'Completed', 'Failed')),
    Method NVARCHAR(10) NOT NULL CHECK (Method IN ('Cash', 'Card'))
);


-- ==========================
--  INSERT DUMMY DATA
-- ==========================

-- 1 Insert Users
INSERT INTO Users (Name, Username, Password, Email, PhoneNum, Role)
VALUES 
('Ali Khan', 'ali123', 'pass1', 'ali@gmail.com', '03001234567', 'Customer'),
('Zara Sheikh', 'zara22', 'pass2', 'zara@gmail.com', '03019870000', 'Admin'),
('Faisal Rehman', 'faisalr', 'pass3', 'faisal@domain.com', '03211234567', 'Staff'),
('Hina Malik', 'hina88', 'pass4', 'hina@domain.com', '03110009988', 'Customer');

-- 2️ Insert Restaurants
INSERT INTO Restaurants (Name, Description, Location, PhoneNum, OperatingHoursStart, OperatingHoursEnd)
VALUES 
('Taste of Italy', 'Authentic Italian Dishes', 'Islamabad', '02134561111', '11:00:00', '23:00:00'),
('Spice Route', 'Desi Food with Modern Twist', 'Karachi', '02199998888', '10:00:00', '22:00:00'),
('Sushi House', 'Fresh Japanese Sushi and Rolls', 'Lahore', '02188887777', '12:00:00', '21:00:00');

-- 3️ RestaurantAdmins
INSERT INTO RestaurantAdmins (RestaurantID, UserID)
VALUES (1, 2), (2, 2);

-- 3.5 RestaurantStaff
INSERT INTO RestaurantStaff (RestaurantID, UserID)
VALUES (1, 3), (2, 1), (3, 4);

-- 4️ Insert Tables
INSERT INTO Tables (Capacity, Status, Description, RestaurantID)
VALUES 
(2, 'Free', 'Romantic 2-seater', 1),
(6, 'Reserved', 'Large family table', 1),
(4, 'Occupied', 'Near entrance', 2),
(8, 'Free', 'Private room', 3);

-- 5️ Insert Reservations
INSERT INTO Reservations (UserID, TableID, Time, Duration, People, Request, Status)
VALUES 
(1, 1, '2025-04-20 18:00:00', 90, 2, 'Anniversary dinner', 'Approved'),
(4, 2, '2025-04-21 19:30:00', 60, 4, 'Birthday surprise', 'Pending');

-- 6️ Insert Reviews
INSERT INTO Reviews (UserID, RestaurantID, Rating, Comment)
VALUES 
(1, 1, 5, 'Loved the pasta!'),
(4, 2, 3, 'Great ambiance, food was okay.'),
(1, 3, 4, 'Sushi was fresh and tasty.');

-- 7️ Insert Cuisines
INSERT INTO Cuisines (Name, Description)
VALUES 
('Italian', 'Pizza, Pasta, Risotto'),
('Desi', 'Biryani, Karahi, Naan'),
('Japanese', 'Sushi, Ramen, Tempura'),
('Mexican', 'Tacos, Burritos, Nachos');

-- 8️ User Preferred Restaurants
INSERT INTO UserPrefRests (UserID, RestaurantID)
VALUES (1, 1), (1, 2), (4, 3);

-- 9️ User Preferred Cuisines
INSERT INTO UserPrefCuisines (UserID, CuisineID)
VALUES (1, 1), (1, 3), (4, 2), (4, 4);

-- 10 Restaurant Cuisines
INSERT INTO RestCuisines (CuisineID, RestaurantID)
VALUES (1, 1), (2, 2), (3, 3), (4, 2);

-- 1️1 Insert Restaurant Images
INSERT INTO RestImages (RestaurantID, Image) VALUES (1, NULL), (2, NULL), (3, NULL);

-- 1️2 Insert Payments
INSERT INTO Payments (ReservationID, Amount, PaymentDate, Status, Method)
VALUES 
(1, 4500, '2025-04-20 17:45:00', 'Completed', 'Card'),
(2, 3000, '2025-04-21 19:00:00', 'Pending', 'Cash');
