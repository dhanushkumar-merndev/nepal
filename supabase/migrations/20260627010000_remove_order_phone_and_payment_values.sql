alter table orders
  alter column phone drop not null;

update orders
set
  phone = null,
  payment_method = null
where phone is not null
   or payment_method is not null;
