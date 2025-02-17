---
title: "Demystifying Replication and Sharding in MongoDB"
date: "2024-04-14"
# description: "Making MongoDB clusters production-ready through database replication and sharding"
tags: ["replication", "sharding", "mongodb", "distributed-systems", "aryaman-batcave"]
newsletter_groups: ["blogs"]
showShareButtons: true
showToc: true
tocOpen: true
---

Making a MongoDB cluster "Production Ready" by performing database Replication and Sharding (horizontal fragmentation)

## What is Replication?

Replication is the method of duplication of data across multiple servers. For example, we have an application and it reads and writes data to a database and says this server A has a name and balance which will be copied/replicate to two other servers in two different locations.

![Replication of a Database](/images/replication-and-sharding-in-mongo/image1.png)

By doing this, will get redundancy and increases data availability with multiple copies of data on different database servers. So, it will increase the performance of reading scaling. The set of servers that maintain the same copy of data is known as replica servers or MongoDB instances.

### Why Replication?

1. High Availability of data disasters recovery
    
2. No downtime for maintenance ( like backups index rebuilds and compaction)
    
3. Read Scaling (Extra copies to read from)
    

## What is Sharding?

Sharding is a method for allocating data across multiple machines. MongoDB used sharding to help deployment with very big data sets and large throughput the operation. By sharding, you combine more devices to carry data extension and the needs of read and write operations.

![A sharded cluster's layout](/images/replication-and-sharding-in-mongo/image2.png)

A sharded cluster consists of 3 things -

1. **Shards** - A replica set that contains a sunset of the cluster's data
    
2. **Mongos** - For a sharded cluster, mongos provides an interface between client applications and sharded cluster
    

**Config Servers** - They are the authoritative source of sharding metadata. The metadata contains the list of sharded collections, routing info etc.

![](/images/replication-and-sharding-in-mongo/image3.png)

### Why Sharding?

1. Database systems having big data sets or high throughput requests can doubt the ability of a single server.
    
2. For example, High query flows can drain the CPU limit of the server.
    
3. The working set sizes are larger than the system's RAM to stress the I/O capacity of the disk drive.
    

## Data Replication in action

1. Insert data into primary repl
    
    ![](/images/replication-and-sharding-in-mongo/image9.png)
    

Going into a secondary repl and querying peaks collection in peaksDB gives us the replicated result -

![](/images/replication-and-sharding-in-mongo/image10.png)

> **WE CANNOT WRITE INTO A REPLICATIONED/SECONDARY DATABASE, WRITES ARE ONLY ALLOWED IN THE PRIMARY REPL.**

![](/images/replication-and-sharding-in-mongo/image11.png)

## Steps to create the above sharded cluster

1. Go to \\mongo\\data\\ folder
    
2. Make cfg0, cfg1, cfg2 (representing 3 replicas of the config server)
    
3. Make a0,a1,a2, b0,b1,b2, c0,c1,c2 (represents the replicas of shard a, b, c respectively)
    
    ![](/images/replication-and-sharding-in-mongo/image13.png)
    
4. Run the 3 config servers in different terminals -
    
    ```powershell
     mongod --configsvr --dbpath cfg0 --port 26050 --logpath log.cfg0 --replSet cfg
    ```
    
    ```powershell
    mongod --configsvr --dbpath cfg1 --port 26051 --logpath log.cfg1 --replSet cfg
    ```
    
    ```powershell
     mongod --configsvr --dbpath cfg2 --port 26052 --logpath log.cfg2 --replSet cfg
    ```
    
    Here,***--configsvr*** represents that we are creating a config server, ***–dbpath*** represents the folder of that config replica, ***–port*** represents the port number on which I want the server to run, ***–logpath*** represents the log file of the particular server, and ***–replSet*** represents the name of the Replication Set.
    
5. Attaching mongo shell to the config server running on port 26050 (as we want to make this server as the Primary Replica of the replSet)
    
    ```powershell
    mongosh --port 26050
    ```
    
6. Initiate Replication Set for the config server, and add the other 2 servers to the set -
    
    ```powershell
    rs.initiate()
    rs.add("localhost:26051")  #Adding the other config server to the replSet
    rs.add("localhost:26052")
    ```
    
    ![](/images/replication-and-sharding-in-mongo/image14.png)
    
    ![](/images/replication-and-sharding-in-mongo/image15.png)
    
7. Doing `rs.status()` we can see the members of the replica set -
    
    ![](/images/replication-and-sharding-in-mongo/image16.png)
    
8. Now launch the servers for the shard 'a' having replicas a0, a1, a2 in it's replSet (each server should be launched in different terminals) -
    
    ```powershell
    mongod --shardsvr --replSet a --dbpath a0 --port 26000 --logpath log.a0
    ```
    
    ```powershell
    mongod --shardsvr --replSet a --dbpath a1 --port 26001 --logpath log.a1
    ```
    
    ```powershell
    mongod --shardsvr --replSet a --dbpath a2 --port 26002 --logpath log.a2
    ```
    
    ![](/images/replication-and-sharding-in-mongo/image17.png)
    
    Do similar to create shards 'b' and 'c' -
    
    ```powershell
    mongod --shardsvr --replSet b --dbpath b0 --port 26100 --logpath log.b0
    mongod --shardsvr --replSet b --dbpath b1 --port 26101 --logpath log.b1
    mongod --shardsvr --replSet b --dbpath b2 --port 26102 --logpath log.b2
    ```
    
    ```powershell
    mongod --shardsvr --replSet c --dbpath c0 --port 26200 --logpath log.c0
    mongod --shardsvr --replSet c --dbpath c1 --port 26201 --logpath log.c1
    mongod --shardsvr --replSet c --dbpath c2 --port 26202 --logpath log.c2
    ```
    
    We can see the servers are actively "LISTENING" on all the ports -
    
    ![](/images/replication-and-sharding-in-mongo/image18.png)
    
9. Now open a new terminal and connect a mongo shell to server running on port 26000, initiate a replSet and add replicas a1 and a2 to it (Inter-connecting the replSet 'a') -
    
    ```powershell
    mongosh --port 26000
    ```
    
    ```powershell
    rs.initiate()
    rs.add("localhost:26001")
    rs.add("localhost:26002")
    ```
    
    ![](/images/replication-and-sharding-in-mongo/image19.png)
    
10. Do the same for replSet 'b' and 'c' -
    
    ```powershell
    mongosh --port 26100
    rs.initiate()
    rs.add("localhost:26101")
    rs.add("localhost:26102")
    ```
    
    ```powershell
    mongosh --port 26200
    rs.initiate()
    rs.add("localhost:26201")
    rs.add("localhost:26202")
    ```
    
11. The next step is to start the mongos instance (in a new terminal) which would be the interaction point of the client with the sharded environment -
    
    ```powershell
    mongos --configdb "cfg/localhost:26050,localhost:26051,localhost:26052" --logpath log.mongos1 --port 26061
    ```
    
    Here, ***–configdb*** represents the ip address of the 3 config servers we created earlier.
    
    ![](/images/replication-and-sharding-in-mongo/image20.png)
    
12. Now connect a mongo shell to this mongos instance (in a new terminal) and start adding the shards to it -
    
    ```powershell
    mongosh --port 26061
    sh.addShard("a/*[*localhost:26000*](http://localhost:26000)*")
    sh.addShard("b/localhost:26100")
    sh.addShard("c/localhost:26200")
    ```
    
    In *sh.addShard("a/*[*localhost:26000*](http://localhost:26000)*")*, 'a' represents replSet, and [localhost:26000](http://localhost:26000) represents the Primary Replica of 'a' replSet.
    
    ![](/images/replication-and-sharding-in-mongo/image21.png)
    
13. To see the status of the sharded environment -
    
    ```powershell
    sh.status()
    ```
    
    ![](/images/replication-and-sharding-in-mongo/image22.png)
    
    We can see that the 3 sharded replSets have been added. Also 1 mongos instance is active.
    
    ![](/images/replication-and-sharding-in-mongo/image23.png)
    
    Also, we can see that the currently sharded database is only config db, as we have not sharded any other database.
    
    ![](/images/replication-and-sharding-in-mongo/image24.png)
    
14. Lets add peaksDB for sharding -
    
    ```powershell
    sh.enableSharding("peaksDB")
    ```
    
    ![](/images/replication-and-sharding-in-mongo/image25.png)
    
    Now doing `sh.status()`, we can see "peaksDB" in "databases" field -
    
    ![](/images/replication-and-sharding-in-mongo/image26.png)
    
15. We can see 1 sample document inside our 'peaksDB.peaks' collection. Lets shard the collection on 'name' field -
    
    1. Create an index of the proposed shard key -
        
        ```powershell
        db.peaks.ensureIndex({name: "hashed"})
        ```
        
    2. Shard the collection using that key -
        
        ```powershell
        sh.shardCollection("peaksDB.peaks", {name:"hashed"})
        ```
        
        ![](/images/replication-and-sharding-in-mongo/image27.png)
        
16. Now doing `sh.status()` we can see that for our collection "peaksDB.peaks" has a shardKey of 'name' and is present on shard 'c' -
    
    ![](/images/replication-and-sharding-in-mongo/image28.png)
    
    Finally, we can get more details of all the shards present -\\
    
    ```powershell
    use config
    db.shards.find()
    ```
    
    ![](/images/replication-and-sharding-in-mongo/image29.png)
    

# References

* [mongodb.com/docs/manual/replication/](https://www.mongodb.com/docs/manual/replication/)

* [mongodb.com/docs/manual/sharding/](https://www.mongodb.com/docs/manual/sharding/)

* [mongodb.com/docs/manual/core/sharded-cluster-config-servers/](https://www.mongodb.com/docs/manual/core/sharded-cluster-config-servers/)

* [youtube.com/@vemarahub](https://www.youtube.com/@vemarahub)

* [engineeringdigest.net](https://www.youtube.com/redirect?event=channel_description&redir_token=QUFFLUhqbTNLVnQyczlPSDAtZHNWcVJDc1Axc0tKM0J0UXxBQ3Jtc0tsX2NSSEJiWTlnZG5Xc0VIUXJvLVJTSUs3OVk4RDZ6NGgwSEhQT2hJVkNUODFzNjVRRUl0WEl5enBPUDFvcDZZTGIweHJzaWpzQ1FMTWFiVHdGdE9FeXZtN2pGUWVTTFBmQTdCajlLMGFrNk1YSktaaw&q=https%3A%2F%2Fengineeringdigest.net%2F)
