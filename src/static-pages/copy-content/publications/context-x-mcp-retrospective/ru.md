Context X MCP фиксирует ранний эксперимент по подготовке контекста до выполнения агентной задачи. Репозиторий зарегистрировал stdio MCP-инструменты для enrichment контекста, поиска истории и оценки качества. Также была задана граница coordinator для выбора темы и оркестрации инструментов.

Context X остался прототипом: coordinator возвращал placeholder responses для enrichment и history search, а vector memory не была реализована.

Этот вопрос получил продолжение в стеке Agent Portal. Team memory задаёт один настроенный content root, глобальные skills и project-specific skills в workspace. Resolver выбирает контекст под задачу и формирует ограниченный пакет до делегирования.
