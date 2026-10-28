TicketHub — System Design Document1. Requirements
Functional Requirements
Catalog & Browsing: Users can search and view events, venues, seat maps, and real-time ticket availability.Ticket Reservation & Purchase: Users can select specific seats, reserve them temporarily during a checkout hold window, and complete payment processing.Overbooking Prevention: The system must strictly guarantee that a single seat is never double-booked or sold to more than one customer.
Ticket Management: Users can view their active reservations, retrieve booking confirmations, and access digital tickets.Non-Functional Requirements
High Availability: Core read pathways (event details, seat map views) must maintain high uptime and fault tolerance during traffic spikes.Low Latency Reads: Browsing event details and loading seat maps must return in under $100\text{ ms}$.Strict Consistency (ACID): Seat reservation and checkout transactions must maintain strong transactional consistency to eliminate race conditions.
Flash Sale Scalability: The architecture must handle sudden, massive traffic bursts when popular concert tickets go live without degrading the core checkout pipeline.2. Capacity & Load EstimatesCore System Metrics & AssumptionsRegistered Users: 2,000,000Normal Daily Active Users (DAU): 50,000Normal Daily Page Views: $50,000 \text{ visitors} \times 10 \text{ pages} = 500,000 \text{ views/day}
$Normal Daily Ticket Sales: 5,000 tickets/dayFlash Sale Burst Event: 200,000 users competing for 20,000 seats within the first 10 minutes ($600\text{ seconds}$).A. Normal Day EstimatesRead Throughput (Average):$$\text{Average Read QPS} = \frac{500,000 \text{ views}}{86,400 \text{ seconds}} \approx 5.79 \text{ QPS}$$Write Throughput (Average):$$\text{Average Write QPS} = \frac{5,000 \text{ ticket sales}}{86,400 \text{ seconds}} \approx 0.06 \text{ QPS}$$B.
 Flash Sale Peak Estimates (10-Minute Window)Concurrent Active Users: 200,000 users targeting a single event.Checkout/Write Requests: Assuming all 200,000 users attempt to reserve a seat within the 10-minute window:$$\text{Peak Write QPS} = \frac{200,000 \text{ reservation attempts}}{600 \text{ seconds}} \approx 333.33 \text{ QPS}$$Read Requests (Polling Seat Availability & Page Refreshes):
  Assuming each user refreshes or polls seat map availability once every 5 seconds during the 10-minute window ($120 \text{ requests/user}$):$$\text{Total Read Requests} = 200,000 \text{ users} \times 120 \text{ requests} = 24,000,000 \text{ reads}$$$$\text{Peak Read QPS} = \frac{24,000,000 \text{ reads}}{600 \text{ seconds}} = 40,000 \text{ QPS}$$3. API SpecificationMethodPathDescriptionSuccess StatusGET/api/v1/events
Retrieves a paginated list of upcoming events.200 OKGET/api/v1/events/{id}/seatsRetrieves real-time seat map availability for a specific event.200 OKPOST/api/v1/reservationsHolds a selected seat temporarily (10-minute hold) during checkout.201 CreatedPOST/api/v1/payments/checkoutProcesses payment for an active reservation and issues digital tickets.200 OKGET/api/v1/users/me/ticketsRetrieves all confirmed tickets for the authenticated user.200 OK4. Data Model
Relational Schema 
Tablesusersuser_id (INT, Primary Key)full_name (VARCHAR 100)email (VARCHAR 255, Unique)created_at (TIMESTAMP)eventsevent_id (INT, Primary Key)title (VARCHAR 200)venue_name (VARCHAR 150)event_time (TIMESTAMP)seatsseat_id (INT, Primary Key)event_id (INT, Foreign Key $\rightarrow$ events.event_id)section (VARCHAR 20)row_number (VARCHAR 10)seat_number (VARCHAR 10)price (DECIMAL(10,2))status (VARCHAR 20) — (AVAILABLE, RESERVED, SOLD)version (INT) — Used for optimistic concurrency lockingreservationsreservation_id (INT, Primary Key)user_id (INT, Foreign Key $\rightarrow$ users.user_id)seat_id (INT, Foreign Key $\rightarrow$ seats.seat_id)status (VARCHAR 20) — (PENDING, COMPLETED, EXPIRED)reserved_at (TIMESTAMP)expires_at (TIMESTAMP)ticketsticket_id (INT, Primary Key)reservation_id (INT, Foreign Key $\rightarrow$ reservations.reservation_id)user_id (INT, Foreign Key $\rightarrow$ users.user_id)seat_id (INT, Foreign Key $\rightarrow$ seats.seat_id)qr_code_hash (VARCHAR 255)issued_at (TIMESTAMP)Entity Relationshipsusers to reservations (One-to-Many):
 A single user can create multiple reservation attempts over time, but each reservation record belongs strictly to one user.events to seats (One-to-Many): An event contains thousands of individual seat records, while each seat record maps to a specific event.seats to reservations (One-to-One): An active reservation holds exactly one seat, and a seat can only be tied to one active reservation at a time.reservations to tickets (One-to-One): A successfully paid reservation produces exactly one issued ticket.5. System Architecture                                [ Client (Web/Mobile) ]
                                           |
                                     ( DNS Lookup )
                                           v
                                       [  DNS  ]
                                           |
                                           v
                                       [  CDN  ] (Static Map Assets & UI)
                                           |
                                           v
                             [ Virtual Waiting Room Queue ]
                                           |
                                           v
                                   [ Load Balancer ]
                                    /              \
                                   v                v
                          [ App Server 1 ]    [ App Server 2 ]
                             /     |             /     |
                            /      |            /      |
                           v       |           v       |
           +-------------------+   |   +-------------------+
           | Redis Cache &     |   |   | Asynchronous      |
           | Distributed Locks |   |   | Worker Queue      |
           +-------------------+   |   +-------------------+
                     ^             |             |
                     |             v             v
                     |   +----------------------------------+
                     +---| Primary Relational DB (Writes)   |
                         +----------------------------------+
                                           |
                                           v
                         +----------------------------------+
                         | Read Replicas (Seat Map Queries) |
                         +----------------------------------+
Component Responsibilities
DNS & CDN: Caches static web assets, CSS, JavaScript bundles, and venue layout images geographically close to users to minimize latency and bandwidth on origin servers.
Virtual Waiting Room Queue: Rate-limits incoming user requests during flash sales, funneling buyers into the checkout pipeline in managed batches to protect backend infrastructure from collapsing under sudden load spikes.
Load Balancer: Distributes API requests evenly across healthy application server instances to ensure high availability and horizontal expansion.App Servers: Executes reservation business logic, handles token verification, coordinates distributed transactions, and manages API endpoints.Redis Cache & Distributed Lock: 
Holds active seat map states in memory to serve high read traffic ($40,000 \text{ peak QPS}$) and processes atomic key lock acquisitions during seat selection.
Primary Relational DB: Enforces strong ACID transactional guarantees, row locks, and durable writes for confirmed seat reservations and payments.Read Replicas: Handles offloaded query operations (such as browsing event lists and user ticket histories) from the primary database instance.Asynchronous Worker Queue: Decouples background processing tasks, such as triggering reservation expiration cleanups and rendering/emailing PDF ticket confirmations.
 Overbooking Prevention MechanicsTo guarantee that two people can never purchase the same seat, TicketHub implements a multi-tiered concurrency control pipeline combining Redis Atomic Locks, Database-Level Conditional Updates (Optimistic Concurrency Control), and TTL-Based Hold Windows.User A & User B click "Reserve Seat #101" at the exact same millisecond
                       |
                       v
         [ Redis Distributed Lock (Atomic) ]
          /                               \
    Acquires Lock                       Lock Denied
         |                                 |
         v                                 v
[ PostgreSQL Transaction ]          Returns Error:
UPDATE seats                        "Seat is being held"
SET status = 'RESERVED',
    version = version + 1
WHERE seat_id = 101 
  AND status = 'AVAILABLE';
         |
         v
Rows Affected == 1?
   /         \
 YES          NO
  |            |
Success     Rollback

Step-by-Step Prevention ProtocolAtomic Lock Acquisition (Redis Layer):When a user attempts to select Seat #101, the App Server executes an atomic Redis command:$$\text{SETEX } \text{lock:seat:101 } 600 \text{ "user\_id\_123"}$$
Because Redis operates single-threaded for command execution, if two users click the seat simultaneously, only one request acquires the key successfully. 
The losing request receives a null response and is returned a "Seat is currently held by another user" message immediately without touching the database.

If the condition status = 'AVAILABLE' evaluates to 0 affected rows (e.g., if a concurrent transaction committed first), the database rolls back the transaction, preventing a duplicate write.

10-Minute Reservation Expiration (Hold Window):

Upon successful database update, a reservations record is generated with expires_at = NOW() + INTERVAL '10 minutes'.

An asynchronous background worker monitors pending reservations. If payment is not completed within 10 minutes, the worker updates the seat status back to AVAILABLE, releases the Redis lock, and opens the seat back up to the public pool.

7. Architecture Trade-Offs
Trade-Off 1: Virtual Waiting Room vs. Direct Infrastructure Scaling
Decision: Implement a Virtual Waiting Room queue in front of the application gateway during high-demand concert drops.

Trade-Off: Introducing a queue adds user friction, forcing buyers to wait in a virtual line rather than immediately loading the checkout page. However, it prevents system collapse by guaranteeing that the batch of users currently inside the checkout pipeline experiences fast response times (
<100 ms) and zero checkout timeouts during peak bursts of 
40,000 QPS.

Trade-Off 2: Redis Distributed In-Memory Lock vs. Database Row Locking (SELECT FOR UPDATE)
Decision: Use Redis atomic keys as a primary lock filter before querying the primary relational database.

Trade-Off: Relying on Redis introduces extra infrastructure complexity and cache management overhead. However, relying solely on relational database row-level locking (SELECT FOR UPDATE) during a 
333 write QPS flash sale would cause severe lock contention, thread pool exhaustion, and cascading database latency across the entire application. Filtering contention at the Redis cache tier protects primary database performance.
