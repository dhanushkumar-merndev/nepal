alter table orders
  drop column if exists phone,
  drop column if exists payment_method,
  drop column if exists note;
