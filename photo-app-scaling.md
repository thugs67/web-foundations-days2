//System Assumptions
Total Registered Users: 10,000,000 Daily Active Users (DAU): $10\% \times 10,000,000 = 1,000,000$ active users/dayUploads per Active User: 1 photo/dayFeed Views per Active User: 50 feed pages/dayMedia Sizes: Original Photo = 2 MB ($2,000\text{ KB}$), Thumbnail = 50 KBSeconds in a Day: 86,400 seconds (rounded to $\sim 100,000$ seconds for peak calculation estimation)
Capacity Estimates A. Uploads per Second (Write Throughput)Total Daily Uploads: $1,000,000 \text{ photos/day}$Average Upload QPS:$$\frac{1,000,000 \text{ uploads}}{86,400 \text{ seconds}} \approx 11.57 \text{ uploads/sec}$$Peak Upload QPS (2x average):$$\approx 23.14 \text{ uploads/sec}$$
Feed Views per Second (Read Throughput)Total Daily Feed Views: $1,000,000 \times 50 = 50,000,000 \text{ feed views/day}$Average Read QPS:$$\frac{50,000,000 \text{ views}}{86,400 \text{ seconds}} \approx 578.7 \text{ views/sec}$$Peak Read QPS (2x average):$$\approx 1,157.4 \text{ views/sec}$$C. Storage Requirements per YearStorage per Photo (Original + Thumbnail):$$2.0 \text{ MB} + 0.05 \text{ MB} = 2.05 \text{ MB}$$Daily Storage Added:$$1,000,000 \text{ uploads} \times 2.05 \text{ MB} = 2,050,000 \text{ MB} = 2.05 \text{ TB/day}$$Annual Storage Requirement:$$2.05 \text{ TB/day} \times 365 \text{ days} \approx 748.25 \text{ TB/year}$$
//Read vs. Write Workload Profile
SnapShare is heavily read-heavy, with a read-to-write ratio of 50:1 (578.7 read QPS vs. 11.57 write QPS).

Architecture Diagram (Text-Based)
                       [ Client App / Browser ]
                                |
                        ( Requests Reads/Writes )
                                |
                                v
                      +-------------------+
                      | Content Delivery  |
                      |   Network (CDN)   |
                      +-------------------+
                                |
                                v
                      +-------------------+
                      |   Load Balancer   |
                      +-------------------+
                                |
                                v
                      +-------------------+
                      |    App Servers    |
                      +-------------------+
                      /         |         \
                     /          |          \
                    v           v           v
    +-------------------+ +-----------+ +-------------------+
    | Metadata Cache    | | Message   | | Object Storage    |
    | (Redis/Memcached) | | Queue     | | (AWS S3 / Blob)   |
    +-------------------+ +-----------+ +-------------------+
              |                 |                 ^
              v                 v                 |
    +-------------------+ +-----------+           |
    | Primary Database  | | Thumbnail |-----------+ (Uploads Thumbnail)
    | (Writes)          | | Worker    |
    +-------------------+ +-----------+
              |
              v
    +-------------------+
    | Read Replicas     |
    +-------------------+

// Component Responsibilities
CDN (Content Delivery Network): Caches image files and static metadata geographically close to users to reduce latency and origin server load.

Load Balancer: Distributes incoming HTTP traffic evenly across app servers to prevent any single instance from becoming a performance bottleneck.

App Servers: Executes core application logic, authentication, feed generation algorithms, and coordinates database and storage interactions.

Metadata Cache: Stores user timelines and session data in memory to serve read-heavy feed requests without hitting the database.

Primary Database (Write): Persists authoritative core metadata such as user profiles, follow relationships, and photo details.

Read Replicas: Offloads read queries from the primary database to serve feed building and user profile lookups horizontally.

Object Storage: Stores unstructured image binary files (original photos and thumbnails) durably and at scale.

Message Queue: Decouples photo uploads from image processing by holding asynchronous processing tasks.

Thumbnail Worker: Consumes tasks from the message queue to asynchronously resize uploaded photos into 50 KB thumbnails and store them back in object storage.

//Step-by-Step Upload Flow
Initiate Upload: The user client requests a presigned upload URL from the App Server via the Load Balancer.

Direct Media Upload: The client directly uploads the 2 MB original photo binary to Object Storage using the presigned URL, avoiding app server bandwidth saturation.

Save Metadata: Upon upload completion, the client notifies the App Server, which writes the photo record (photo_id, user_id, s3_url, timestamp) to the Primary Database.

Publish Async Task: The App Server publishes a CREATE_THUMBNAIL event containing the photo_id and image path to the Message Queue.

Generate & Save Thumbnail: The Thumbnail Worker pulls the event from the queue, downloads the original image, generates the 50 KB thumbnail, uploads it to Object Storage, and updates the database record with the thumbnail URL.

//Key Trade-offs
Pre-computed Feed (Fan-out on Write) vs. Query on Read (Fan-out on Read):
Trade-off: Pre-computing feeds on upload speeds up feed loading to $O(1)$ reads for users, but it drastically increases background write workloads when high-follower accounts (celebrities) post.Asynchronous Thumbnail Processing vs. Synchronous Processing:
Trade-off: Offloading thumbnail generation to a background queue provides instant response times during photo uploads, but introduces eventual consistency where users may briefly see a missing thumbnail placeholder until background processing completes.
