# Community Streak

**Community Streak** is an innovative web application designed to help individuals achieve their personal goals by creating and maintaining streaks. The app motivates users to stay consistent in their daily activities through social interaction, gamification, and positive reinforcement. 

## Psychological Tricks Used in Community Streak

### 1. **Social Accountability**  
One of the core psychological tricks employed by the app is **social accountability**. Users can create or join streaks with friends, family, or even strangers, which creates a sense of responsibility. Knowing that others are watching or participating in their streak helps individuals stay consistent and motivated.  

### 2. **Gamification and Competition**  
The app introduces a **competitive element** by allowing users to track their progress against others. By viewing rankings, users are encouraged to maintain or surpass their streaks to stay at the top. This taps into the psychological principle of **competition** and **achievement**, which drives people to perform better.

### 3. **Positive Reinforcement**  
Every time a user reaches a milestone in their streak, they receive **positive reinforcement** such as badges, achievements, or progress updates. This triggers the **dopamine system**, rewarding them for consistency and motivating them to keep going.

### 4. **Small Goals with Big Rewards**  
The app focuses on **micro-goals**, breaking down larger objectives into small, manageable daily tasks. This creates a sense of accomplishment, making it easier for users to stick to their goals, as **small wins** lead to long-term success.

### 5. **Streak Building**  
The concept of a **streak**—doing something consistently over a period—leverages the **fear of losing progress**. People are psychologically driven to maintain their streaks to avoid breaking the chain, leading to continued engagement.

## How It Works

1. **Sign Up & User Profile**  
   - Users sign up and create a profile to start tracking their activities.
   - They can customize their profile and choose the activities they want to track.

2. **Creating & Joining Events**  
   - Users can create new streak events, either public or private (invite-only).
   - They can join existing streaks created by other users or browse a variety of publicly available events.

3. **Track Progress**  
   - Users can track their daily progress and see how they compare to others. The app logs their streaks and displays them on the activity matrix.

4. **Engagement & Motivation**  
   - Users can engage with their streak communities, motivate each other, and compete for top spots on the leaderboard. Regular updates and social interactions keep users involved.

5. **Streak Milestones**  
   - As users reach milestones (e.g., completing a streak for 7 days, 30 days), they earn achievements and rewards, which further motivates them to continue.

## Tech Stack

**Backend:**  
- **FastAPI**: Used for building the backend API, providing high-performance endpoints for the app.  
- **SQLite**: A lightweight database used for storing user data, event details, and progress. (Plan to switch to more robust databases like PostgreSQL in the future.)

**Frontend:**  
- **React**: A JavaScript library for building the user interface, providing a smooth and responsive experience for users.  
- **HTML5 & CSS3**: For structuring and styling the app.

**Authentication & Security:**  
- **OAuth2PasswordBearer**: For secure user authentication and authorization, ensuring only authorized users can interact with private events.

**APIs & Integrations:**  
- **JWT (JSON Web Tokens)**: Used for secure, token-based authentication to protect user data and sessions.  
- **Celery**: For handling background tasks like sending reminders or processing event data.

## Key Features

- **Create Custom Events**: Users can create streaks for any goal they choose—fitness, reading, study, etc.  
- **Join Public & Private Streaks**: Participate in challenges with others or keep it private among friends and family.  
- **Leaderboards & Rankings**: See how you stack up against other users and get motivated to stay consistent.  
- **Daily Reminders**: Receive daily push notifications or email reminders to keep you on track.  
- **Streak Milestones & Achievements**: Celebrate your wins with badges, rewards, and progress tracking.

## Future Improvements

- Integration with fitness apps to track physical activity.
- Ability to add streaks based on personal metrics (e.g., calories burned, pages read).
- More complex streak events, including multi-task challenges.

## Output Screenshots
Ranking board:
![image](https://github.com/user-attachments/assets/57bc0236-2601-4af6-8d4b-645c1823bcff)

Dark Mode Support:
![image](https://github.com/user-attachments/assets/2359b9c0-167b-471f-a7b3-04bf44ecd0c4)

Home Page:
![image](https://github.com/user-attachments/assets/c785858e-4698-42ea-a543-09898f194191)

Available Actions:

![image](https://github.com/user-attachments/assets/b662fbd6-4511-40c3-89dc-faea45e328c5)

User Streaks:
![image](https://github.com/user-attachments/assets/c31388b0-0d2b-4f13-bd56-e8347744eb23)

Push Notifications Support:

![image](https://github.com/user-attachments/assets/ff88c979-1daf-40e9-b70a-142120caff7c)

![image](https://github.com/user-attachments/assets/bec088a0-6549-4e0d-a2a6-817235aee5c9)


# Build backend docker image

`
\backend> docker build -t fastapi-cs-app .
`

# Mount DB and run 
`
backend> docker run -d -p 80:80 --env-file .env -v .\database\:/backend/database fastapi-cs-app
`