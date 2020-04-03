library(plyr)
library(dplyr)
library(ggplot2)
library(statsr)
library("lme4")
library(report)
library(tidyverse)
library(sjPlot)
library(sjlabelled)
library(sjmisc)
library(rjson)
theme_set(theme_sjplot())

result <- fromJSON(file = "./bootstrap_results.json")

# Convert JSON file to a data frame.
uncertainties <- ldply(result, data.frame)
uncertainties <- unique(uncertainties[c("vars","pearsonr","uncertainty_lower","uncertainty_upper")])

df <- read.csv(file="./processed_data.csv")

df_exclude <- df %>% 
              filter(exclude == 0) 

pop_corrs <- unique(df_exclude[c("vars", "pop_corr")])

df_exclude$visGroup <- factor(df_exclude$visGroup, c("scatter","line","band","hop"))
df_exclude$with_uncertainty <- lapply(df_exclude$visGroup,function(x){
  if (x=="scatter" | x== "line") {
    return ("no")
  } else {
    return ("yes")
  }
})

df_exclude <- left_join(df_exclude, uncertainties, by="vars")
df_exclude$true_uncertainty <- abs(df_exclude$uncertainty_upper-df_exclude$uncertainty_lower)
df_exclude$size_of_belief_change <- abs(df_exclude$diff_belief)
df_exclude$size_of_uncertainty_change <-abs(df_exclude$diff_uncertainty)
df_exclude$population_correlation_abs <- factor(abs(df_exclude$pop_corr))
df_exclude$sample_correlation_abs <- abs(df_exclude$pearsonr)
df_exclude$prior_belief_abs_error <- abs(df_exclude$prior_belief - df_exclude$pearsonr)
df_exclude$posterior_belief_abs_error <- abs(df_exclude$post_belief - df_exclude$pearsonr)
df_exclude$posterior_error <- df_exclude$post_belief - df_exclude$pearsonr


summary(df_exclude)


min(df_exclude$size_of_belief_change)

# Posterior error -----

# hist posterior error by condition and population correlation
ggplot(data=df_exclude) +
  geom_histogram(aes(x=posterior_error)) +
  facet_grid(visGroup ~ pop_corr, scales="free_y")

# hist absolute posterior error by condition and pop corr
ggplot(data=df_exclude) +
  geom_histogram(aes(x=posterior_belief_abs_error)) +
  facet_grid(visGroup ~ pop_corr, scales="free_y")

# hist absolute posterior error by condition and *absolute* pop corr
ggplot(data=df_exclude) +
  geom_histogram(aes(x=posterior_belief_abs_error)) +
  facet_grid(visGroup ~ population_correlation_abs, scales="free_y")


# linear mixed model on absolute posterior error
m = lmer(posterior_belief_abs_error ~ 
              visGroup + population_correlation_abs + 
              (1|usertoken) + (1|vars), 
            df_exclude)
summary(m)
plot_model(m, vline.color = "red",show.values = TRUE, value.offset = .3)

# linear model might not be right in this case because outcome is bounded between 0 and 2;
# can instead use a beta regression model, after transforming the outcome to be in (0, 1) interval
library(glmmTMB)
df_exclude$posterior_belief_abs_error_bnd = df_exclude$posterior_belief_abs_error/2
m = glmmTMB(posterior_belief_abs_error_bnd ~ 
              visGroup + population_correlation_abs + 
              (1|usertoken) + (1|vars), 
            df_exclude, 
            family=list(family="beta", link="logit"))

summary(m)
plot_model(m, vline.color = "red",show.values = TRUE, value.offset = .3)
m %>% report() %>% text_short()


model <- lmer(size_of_belief_change ~ visGroup + sample_correlation_abs + (1 | usertoken) ,data=df_exclude)
model2 <- lmer(diff_uncertainty ~ visGroup + sample_correlation_abs + (1|usertoken) ,data=df_exclude)
model3 <- lmer(posterior_belief_abs_error ~ visGroup * sample_correlation_abs + (1|usertoken),data=df_exclude)
model4 <- lmer(post_uncertainty ~ visGroup * true_uncertainty + (1|usertoken),data=df_exclude)
model_a <- lmer(post_uncertainty ~ visGroup + sample_correlation_abs * prior_belief_abs_error  + (1|usertoken),data=df_exclude)
model_b <- lmer(post_uncertainty ~ visGroup * prior_belief_abs_error + true_uncertainty * prior_belief_abs_error  + (1|usertoken),data=df_exclude)


model_c <- lmer(diff_belief ~ visGroup * pearsonr + (1|usertoken),data=df_exclude)
model_d <- lmer(diff_uncertainty ~ visGroup * pearsonr + (1|usertoken),data=df_exclude)
model_e <- lmer(diff_uncertainty ~ visGroup + true_uncertainty + (1|usertoken) ,data=df_exclude)
model_f <- lmer(posterior_error ~ visGroup * sample_correlation_abs + (1|usertoken),data=df_exclude)

plot_model(model, vline.color = "red",show.values = TRUE, value.offset = .3)
plot_model(model2, vline.color = "red",show.values = TRUE, value.offset = .3)
plot_model(model3, vline.color = "red",show.values = TRUE, value.offset = .3)
plot_model(model4, vline.color = "red",show.values = TRUE, value.offset = .3)
plot_model(model_a, vline.color = "red",show.values = TRUE, value.offset = .3)
plot_model(model_b, vline.color = "red",show.values = TRUE, value.offset = .3)
plot_model(model_e, vline.color = "red",show.values = TRUE, value.offset = .3)
plot_model(model_f, vline.color = "red",show.values = TRUE, value.offset = .3)

model %>% report() %>% table_long()
model %>% report() %>% text_short()

model2 %>% report() %>% table_long()
model2 %>% report() %>% text_long()

model3 %>% report() %>% table_long()
model3 %>% report() %>% text_long()

model4 %>% report() %>% table_long()
model4 %>% report() %>% text_long()

model_a %>% report() %>% text_short()


# modeling using all observations prior and post...

to_include <- unique(df_exclude$usertoken)
df2 = read.csv('./mturkall.csv')
df2_exclude <- df2 %>% filter(df2$usertoken %in% to_include)
df2_exclude$draw_state <- factor(dummy(df2_exclude$state))
df2_exclude$elicitation_state <- factor(ifelse(df2_exclude$state == "draw1","prior","posterior"),c("prior","posterior"))

df2_exclude <- left_join(df2_exclude, pop_corrs, by="vars")
df2_exclude$population_correlation_abs <- factor(abs(df2_exclude$pop_corr))
df2_exclude$belief_absolute_error <- abs(df2_exclude$belief - df2_exclude$pop_corr)
df2_exclude$visGroup <- factor(df2_exclude$visGroup, c("scatter","line","band","hop"))
df2_exclude$uncertainty_size <- abs(df2_exclude$uncertaintyUpper - df2_exclude$uncertaintyLower)
df2_exclude <- left_join(df2_exclude, uncertainties, by="vars")
df2_exclude$true_uncertainty <- abs(df2_exclude$uncertainty_upper-df2_exclude$uncertainty_lower)

model5 <- lmer(belief_absolute_error ~ visGroup * elicitation_state + population_correlation_abs +(1|usertoken),data=df2_exclude)
plot_model(model5, vline.color = "red",show.values = TRUE, value.offset = .3)
model5 %>% report() %>% text_short()

model6 <-lmer(uncertainty_size ~ visGroup * elicitation_state + population_correlation_abs +  (1|usertoken),data=df2_exclude)
plot_model(model6, vline.color = "red",show.values = TRUE, value.offset = .3)
model6 %>% report() %>% text_short()

model7 <-lmer(uncertainty_size ~ visGroup + true_uncertainty   +  (1|usertoken),data=df2_exclude)
plot_model(model7, vline.color = "red",show.values = TRUE, value.offset = .3)
model7 %>% report() %>% text_short()



