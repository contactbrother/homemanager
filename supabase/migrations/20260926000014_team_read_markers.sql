-- Phase 3: the team console uses the same unread tracking as clients. Start each team
-- member at "all caught up" so existing history does not show as unread.
insert into task_reads (user_id, task_id, last_read_at)
select pr.id, t.id, now()
from tasks t cross join profiles pr
where pr.role = 'admin'
on conflict do nothing;
