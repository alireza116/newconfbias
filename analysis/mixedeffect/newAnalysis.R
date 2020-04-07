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
library(glmmTMB)
theme_set(theme_sjplot())

## reading and processing the data

result <- fromJSON(file = "./bootstrap_results.json")

# Convert JSON file to a data frame.
uncertainties <- ldply(result, data.frame)
uncertainties <- unique(uncertainties[c("vars","pearsonr","uncertainty_lower","uncertainty_upper")])

df <- read.csv(file="./processed_data.csv")

df_exclude <- df %>% 
  filter(exclude == 0) 

pop_corrs <- unique(df_exclude[c("vars", "pop_corr")])

df_exclude$visGroup <- factor(df_exclude$visGroup, c("scatter","line","band","hop"))
df_exclude$with_uncertainty <- sapply(df_exclude$visGroup,function(x){
  if (x=="scatter" | x== "line") {
    return ("no")
  } else {
    return ("yes")
  }
})
df_exclude$with_uncertainty <- factor(df_exclude$with_uncertainty)

df_exclude <- left_join(df_exclude, uncertainties, by="vars")
df_exclude$true_uncertainty <- abs(df_exclude$uncertainty_upper-df_exclude$uncertainty_lower)
df_exclude$size_of_belief_change <- abs(df_exclude$diff_belief)
df_exclude$size_of_uncertainty_change <-abs(df_exclude$diff_uncertainty)
df_exclude$population_correlation_abs <- factor(abs(df_exclude$pop_corr))
df_exclude$sample_correlation_abs <- abs(df_exclude$pearsonr)
df_exclude$prior_belief_abs_error <- abs(df_exclude$prior_belief - df_exclude$pearsonr)
df_exclude$posterior_belief_abs_error <- abs(df_exclude$post_belief - df_exclude$pearsonr)
df_exclude$posterior_error <- df_exclude$post_belief - df_exclude$pearsonr
df_exclude$posterior_belief_abs_error_bnd = df_exclude$posterior_belief_abs_error/2
df_exclude$prior_belief_abs_error_bnd <- df_exclude$prior_belief_abs_error/2


df_exclude$size_of_belief_change_bnd <- df_exclude$size_of_belief_change /2

df_exclude <- df_exclude %>% mutate(prior_uncertainty = replace(prior_uncertainty, prior_uncertainty == 0, 0.000001))
df_exclude <- df_exclude %>% mutate(post_uncertainty = replace(post_uncertainty, post_uncertainty == 0, 0.000001))

df_exclude$post_prior_uncertainty <- df_exclude$post_uncertainty / df_exclude$prior_uncertainty

df_exclude <- na.omit(df_exclude)

m1 = glmmTMB(posterior_belief_abs_error_bnd ~ 
               visGroup + sample_correlation_abs +
              (1|usertoken) + (1|vars), 
            df_exclude, 
            family=list(family="beta", link="logit"))


plot_model(m1, vline.color = "red",show.values = TRUE, value.offset = .3)


ggplot(data=df_exclude) +
  geom_density(aes(x=posterior_belief_abs_error_bnd))


model <- lmer(size_of_belief_change ~ visGroup + sample_correlation_abs + (1 | usertoken)+ (1|vars) ,data=df_exclude)
model2 <- lmer(diff_uncertainty ~ visGroup + sample_correlation_abs  + (1|usertoken) + (1|vars) ,data=df_exclude)


plot_model(model, vline.color = "red",show.values = TRUE, value.offset = .3)

plot_model(model2, vline.color = "red",show.values = TRUE, value.offset = .3)

plot_model(model3, vline.color = "red",show.values = TRUE, value.offset = .3)


