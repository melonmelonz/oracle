---
title: Distributed Systems
tags: [distributed-systems, consensus, lamport, theory, systems]
era: present
---

# Distributed Systems

## The hard part

A distributed system is a set of computers that cooperate over a network and have
to behave, to the outside, like one reliable thing. The difficulty is that the
network can drop messages, delay them, or deliver them out of order, and any
machine can fail at any moment, and no node can ever be certain whether another
node has died or is just slow. Leslie Lamport put the strangeness best: "A
distributed system is one in which the failure of a computer you didn't even know
existed can render your own computer unusable."

## Time is a lie

In a single program you can trust a clock and an order of events. Across machines
you cannot, because there is no shared now. Lamport's 1978 work on logical clocks
showed how to reason about the order of events using causality rather than
wall-clock time: if one event could have influenced another, it comes first, and if
they could not have affected each other, their order does not matter. Vector clocks
extend this to track causality between many nodes at once. Most of the field is, in
one way or another, about inventing a usable notion of order where physics refuses
to give you one.

## Agreeing on anything

Consensus is the problem of getting a group of nodes to agree on a single value,
even when some of them fail. It sounds simple and is brutally hard. The FLP result
proved that in a fully asynchronous network, no algorithm can guarantee consensus
if even one node may fail, which is why real systems lean on timeouts and
probabilities rather than perfect guarantees. Lamport's Paxos solved practical
consensus but became infamous for being difficult to understand. Raft, designed by
Diego Ongaro and John Ousterhout, set out to do the same job in a way humans could
actually follow, and largely succeeded; it is now the consensus algorithm in many
production systems.

## The laws everyone quotes

A few ideas get repeated until they become folklore. The CAP theorem, from Eric
Brewer, says that when the network partitions, a system must choose between staying
consistent and staying available; it cannot have both during the split. The Two
Generals Problem shows that two parties cannot achieve guaranteed agreement over an
unreliable channel, no matter how many messages they send. The Byzantine Generals
Problem asks how to agree when some participants are not just failing but actively
lying. And the line every engineer knows, attributed to Phil Karlton: "There are
only two hard things in computer science: cache invalidation and naming things."
