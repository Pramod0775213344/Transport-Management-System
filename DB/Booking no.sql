SELECT 
CONCAT(
upper(substring(substring_index(c.company_name, ' ' , 1),1,1)),
IF(LOCATE(' ', company_name) > 0, upper(substring(substring_index(substring_index(c.company_name, ' ' , 2),' ',-1),1,1)), ''),
IF(LOCATE(' ', company_name, LOCATE(' ', company_name) + 1) > 0, upper(substring(substring_index(substring_index(c.company_name, ' ' , 3),' ',-1),1,1)), ''),
IF(LOCATE(' ', company_name, LOCATE(' ', company_name, LOCATE(' ', company_name) + 1) + 1) > 0,upper(substring(substring_index(substring_index(c.company_name, ' ' , 4),' ',-1),1,1)), ''),
 RIGHT(YEAR(CURDATE()), 2))
FROM tms.customer as c;