---
title: Distributed Systems
domain: distsys
tags: [distributed-systems, consensus, cap, raft, paxos, consistency, replication, theory]
vocab:
  - { term: CAP Theorem, def: "When a network partition occurs, a distributed system must choose between consistency and availability; it cannot keep both during the split." }
  - { term: Consensus, def: "The problem of getting a set of nodes to agree on a single value even though some may fail." }
  - { term: Raft, def: "A leader-based consensus algorithm by Ongaro and Ousterhout, designed to be understandable while matching Paxos in power." }
  - { term: Paxos, def: "Lamport's family of consensus algorithms; correct and influential, but famously hard to follow." }
  - { term: Linearizability, def: "A strong consistency model where each operation appears to take effect instantaneously at one point between its call and return, respecting real-time order." }
  - { term: Eventual Consistency, def: "A weak model where, once writes stop, all replicas converge to the same value after some delay." }
  - { term: Partition, def: "A network failure that splits nodes into groups that cannot communicate with each other." }
  - { term: Quorum, def: "A subset of nodes (usually a majority) whose agreement is required before an action counts as decided." }
  - { term: Idempotency, def: "A property where applying the same operation more than once has the same effect as applying it exactly once." }
  - { term: Replication, def: "Keeping copies of the same data on multiple nodes for durability, availability, or read scaling." }
  - { term: Two-Phase Commit, def: "An atomic-commit protocol (prepare then commit) that blocks if the coordinator fails after votes are collected." }
related: [linux-kernel, neuromancer]
source: "Lamport 1978/1998; Herlihy and Wing 1990 (linearizability); Fischer, Lynch, Paterson 1985 (FLP); Brewer's CAP conjecture 2000 and 2012 clarification, Gilbert and Lynch 2002 proof; Ongaro and Ousterhout, In Search of an Understandable Consensus Algorithm, USENIX ATC 2014; Vogels, Eventually Consistent 2008."
---

# Distributed Systems

## The hard part

A distributed system is a set of computers that cooperate over a network and try to behave, to the outside, like one reliable thing. That is the goal. The trouble is everything underneath it. The network can drop messages, delay them, duplicate them, or deliver them out of order. Any machine can fail at any moment. And no node can ever be certain whether another node has died or is just slow, because a crashed peer and a peer stuck behind a long delay look identical from the outside. This is partial failure: not the clean all-or-nothing crash of a single program, but a world where some components keep running while others vanish without warning. Leslie Lamport put the strangeness of it best in 1987: "A distributed system is one in which the failure of a computer you didn't even know existed can render your own computer unusable." Most of the field is the slow, careful work of building reliable behavior on top of these unreliable parts.

## Time is a lie

In a single program you can trust a clock and a clean order of events. Across machines you cannot. There is no shared now. Physical clocks drift, and synchronizing them perfectly over a lossy network is impossible. Lamport's 1978 paper on logical clocks showed how to reason about order using causality instead of wall-clock time: if one event could have influenced another, it comes first; if two events could not have affected each other, their order simply does not matter and you should not pretend it does. Vector clocks extend the idea to track causality among many nodes at once, so a system can tell whether two updates are causally related or genuinely concurrent. None of this gives you a true global timeline. It gives you a usable substitute, an ordering grounded in what actually could have caused what, which is often all you need.

## Agreeing on anything

Consensus is the problem of getting a group of nodes to agree on one value, even when some of them fail. It sounds modest. It is brutally hard. In 1985 Fischer, Lynch, and Paterson proved the FLP result: in a fully asynchronous network, no deterministic protocol can guarantee consensus if even a single node may crash. The reason is the same indistinguishability from before; you cannot reliably tell a dead node from a slow one, so an algorithm can be forced to wait forever. FLP does not say consensus is hopeless in practice. It says you cannot guarantee both safety and termination under pure asynchrony. Real systems escape by relaxing assumptions: they add timeouts, assume partial synchrony, or inject randomness, trading a perfect guarantee for one that holds almost always. That tradeoff is the quiet foundation under nearly every coordination protocol that ships.

## Paxos and Raft

Lamport's Paxos, published in full in 1998, was the first widely accepted solution to practical consensus, and it is correct and deeply influential. It is also notorious for being hard to understand, which made it hard to implement faithfully. Raft came later as a deliberate response. In their 2014 USENIX ATC paper "In Search of an Understandable Consensus Algorithm," Diego Ongaro and John Ousterhout set out to match Paxos in power while being learnable, and a user study backed up the claim. Raft works through a single strong leader. Time is divided into terms, each beginning with an election; nodes are followers, candidates, or the one leader. Randomized timeouts break ties so a split vote resolves quickly. The leader takes client commands, appends them to a replicated log, and ships them to followers via AppendEntries calls that double as heartbeats. An entry is committed once a quorum, a majority, has it durably on disk; only then is it applied. Raft now sits underneath many production systems, etcd and CockroachDB among them.

## CAP, stated honestly

The CAP theorem gets quoted constantly and misquoted nearly as often. Eric Brewer floated it as a conjecture at the 2000 PODC symposium, and Seth Gilbert and Nancy Lynch of MIT proved a formal version in 2002. The popular framing, "pick two of three among consistency, availability, and partition tolerance," is misleading, and Brewer himself said so in a 2012 clarification. Partition tolerance is not a property you choose. Networks partition whether you want them to or not, so any real distributed system must tolerate partitions. The honest statement is narrower and more useful: when a partition occurs, a system must choose between consistency (refuse to serve possibly stale data) and availability (answer anyway, risking staleness). When the network is healthy, you can have both. CAP is a constraint about the behavior during a split, not a permanent budget of two properties. It says nothing about latency, and it does not mean databases are forever stuck picking a single team.

## Consistency models

Consistency models describe what guarantees a system makes about reads after writes, and they form a spectrum from strict to loose. Linearizability, defined formally by Maurice Herlihy and Jeannette Wing in 1990, is the strong end. Each operation appears to take effect instantaneously at a single point between its invocation and its response, and that ordering respects real time; once a write completes, every later read sees it or something newer. Linearizability also composes: a system built from linearizable parts is itself linearizable, which is rare and valuable. The cost is coordination, and under partitions it forces the consistency side of CAP. Eventual consistency sits at the loose end. It was popularized by Werner Vogels in his 2008 piece "Eventually Consistent," and it promises only that if writes stop, replicas will converge to the same value after some inconsistency window. In between live causal, read-your-writes, and monotonic-read consistency, each trading a precise amount of strictness for availability and lower latency.

## Replication, retries, and idempotency

Replication keeps copies of data on several nodes, which buys durability and availability and lets reads spread across machines. The catch is keeping the copies in agreement, which is where quorums and consensus reappear. A common rule is that reads and writes each touch a quorum so their sets overlap, guaranteeing a read sees the latest acknowledged write. Replication also forces a choice between synchronous (wait for replicas, safer, slower) and asynchronous (acknowledge early, faster, riskier on failure). Retries are the other everyday hazard. Because a node cannot tell a lost request from a lost response, clients resend, and a resend can mean an operation runs twice. The defense is idempotency: design operations so that applying them more than once has the same effect as applying them once. Charging a card by a request ID that the server deduplicates is idempotent; blindly incrementing a balance is not. Atomic commit across nodes raises the same problem at scale. Two-phase commit (prepare, then commit) gives atomicity but blocks if the coordinator dies after collecting votes, leaving participants holding locks; that is why modern systems replicate the coordinator's decision through Raft or Paxos rather than trusting one machine.
