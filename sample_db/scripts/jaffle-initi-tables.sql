create table raw_customers
(
    id         integer,
    first_name varchar(10),
    last_name  varchar(2)
);

create table raw_orders
(
    id         integer,
    user_id    integer,
    order_date date,
    status     varchar(14)
);

create table raw_payments
(
    id             integer,
    order_id       integer,
    payment_method varchar(13),
    amount         integer
);