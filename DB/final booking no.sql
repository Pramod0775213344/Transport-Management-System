SELECT concat(concat(
upper(substring(substring_index(company_name, ' ' , 1),1,1)),
IF(LOCATE(' ', company_name) > 0, upper(substring(substring_index(substring_index(company_name, ' ' , 2),' ',-1),1,1)), ''),
IF(LOCATE(' ', company_name, LOCATE(' ', company_name) + 1) > 0, upper(substring(substring_index(substring_index(company_name, ' ' , 3),' ',-1),1,1)), ''),
IF(LOCATE(' ', company_name, LOCATE(' ', company_name, LOCATE(' ', company_name) + 1) + 1) > 0,upper(substring(substring_index(substring_index(company_name, ' ' , 4),' ',-1),1,1)), ''),
 RIGHT(YEAR(CURDATE()), 2)),
 lpad(substring( max(b.booking_no),6)+1,5,0)) 
 FROM tms.booking as b inner join tms.customer on b.customer_id = tms.customer.id group by customer_id;